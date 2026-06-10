import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';

export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PropertyDoc {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceType: string;
  propertyType: string;
  status: string;
  images?: string[];
  location: { address: string; city: string; state: string };
  features: {
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    areaUnit: string;
    parking?: boolean;
    furnished?: boolean;
  };
  amenities: string[];
  agent: { name: string; phone: string; email: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function buildPropertyContext(properties: PropertyDoc[]): string {
  if (!properties.length) return 'No properties in DB matching this criteria.';
  return properties.slice(0, 8).map((p) =>
    `ID:${p._id} | ${p.title} | ${p.location.city} | ${formatPrice(p.price)} | ` +
    `Type:${p.propertyType} | ${p.features.bedrooms ? p.features.bedrooms + ' BHK | ' : ''}` +
    `${p.features.area} ${p.features.areaUnit} | Status:${p.status} | ` +
    `Amenities: ${p.amenities.slice(0, 4).join(', ')} | ` +
    `Image:${p.images?.[0] || 'none'}`
  ).join('\n');
}

// ─── Language Detection ───────────────────────────────────────────────────────
function detectLanguage(messages: ChatMessage[]): 'hindi' | 'hinglish' | 'english' {
  // Only look at USER messages
  const userText = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
  if (!userText) return 'english';

  const hindiUnicodeWords = ['कीमत','प्रॉपर्टी','मकान','फ्लैट','विला','बताओ','चाहिए','देखना','खरीदना','कितना','कहाँ','क्या','कैसे','नोएडा','दिल्ली','मुझे','हमें','यहाँ','वहाँ','ठीक','सही'];
  const hasHindiUnicode = hindiUnicodeWords.some(w => userText.includes(w)) || /[\u0900-\u097F]/.test(userText);
  const hasLatinScript = /[a-zA-Z]/.test(userText);

  if (hasHindiUnicode && hasLatinScript) return 'hinglish';
  if (hasHindiUnicode) return 'hindi';
  return 'english';
}

// ─── Extract what user has told us so far ─────────────────────────────────────
function extractConversationContext(messages: ChatMessage[]): {
  propertyType?: string;
  city?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  wantsSiteVisit?: boolean;
  wantsBrochure?: boolean;
  wantsCallback?: boolean;
  wantsMoreProperties?: boolean;
} {
  const allUserText = messages.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase();
  const ctx: ReturnType<typeof extractConversationContext> = {};

  // Property type
  if (/apartment|flat|फ्लैट|bhk|अपार्टमेंट/.test(allUserText)) ctx.propertyType = 'apartment';
  else if (/villa|विला|bungalow|floor|फ्लोर/.test(allUserText)) ctx.propertyType = 'villa';
  else if (/farmhouse|farm house|farm-house|फार्महाउस/.test(allUserText)) ctx.propertyType = 'farmhouse';
  else if (/plot|land|प्लॉट|जमीन/.test(allUserText)) ctx.propertyType = 'plot';
  else if (/commercial|office|shop|दुकान/.test(allUserText)) ctx.propertyType = 'commercial';

  // Location (SS Realty areas first, then generic)
  const locationMap: Record<string, string> = {
    sultanpur: 'Sultanpur', chattarpur: 'Chattarpur', chhatarpur: 'Chattarpur',
    jaunapur: 'Jaunapur', 'gwal pahari': 'Gwal Pahari', gwalpahari: 'Gwal Pahari',
    noida: 'Noida', 'greater noida': 'Greater Noida',
    gurugram: 'Gurugram', gurgaon: 'Gurugram',
    delhi: 'Delhi', faridabad: 'Faridabad', ghaziabad: 'Ghaziabad',
  };
  for (const [key, val] of Object.entries(locationMap)) {
    if (allUserText.includes(key)) { ctx.city = val; break; }
  }

  // BHK
  const bedroomMatch = allUserText.match(/(\d)\s*bhk/);
  if (bedroomMatch) ctx.bedrooms = parseInt(bedroomMatch[1]);

  // Budget
  const croreMatch = allUserText.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|करोड़)/);
  const lakhMatch  = allUserText.match(/(\d+(?:\.\d+)?)\s*(?:l|lakh|लाख)/);
  if (allUserText.includes('5 cr+') || allUserText.includes('above 5 cr') || allUserText.includes('above 5 crore')) {
    ctx.maxPrice = 1000000000; // 100 Cr (effectively no limit)
  } else if (croreMatch) {
    ctx.maxPrice = parseFloat(croreMatch[1]) * 10000000;
  } else if (lakhMatch) {
    ctx.maxPrice = parseFloat(lakhMatch[1]) * 100000;
  }

  // Intent
  ctx.wantsSiteVisit      = /site visit|visit|tour|विजिट|देखना|आना/.test(allUserText);
  ctx.wantsBrochure        = /brochure|pdf|catalog|ब्रोशर/.test(allUserText);
  ctx.wantsCallback        = /call|callback|ring|speak|talk|फोन|बात|कॉल/.test(allUserText);
  ctx.wantsMoreProperties  = /more|aur|show more|or properties|aur dikao|more properties/.test(allUserText);

  return ctx;
}

// ─── Determine the NEXT question to ask (no repeats) ─────────────────────────
function detectStage(messages: ChatMessage[]): {
  stage: string;
  showPropertyTypePicker: boolean;
  showLocationPicker: boolean;
} {
  const ctx = extractConversationContext(messages);

  // Check what the ASSISTANT already asked (to avoid repeats)
  const assistantText = messages.filter(m => m.role === 'assistant').map(m => m.content.toLowerCase()).join(' ');
  const alreadyAskedType     = /looking for|property type|apartment|villa|farmhouse|plot|commercial/.test(assistantText);
  const alreadyAskedLocation = /location|area|sultanpur|chattarpur|jaunapur|gwal pahari/.test(assistantText);
  const alreadyAskedBHK      = /2 bhk|3 bhk|4 bhk|kitne bhk|bhk|bedroom/.test(assistantText);
  const alreadyAskedBudget   = /budget|range|price range|kitna budget|50l|1 cr/.test(assistantText);

  // Action intents override the funnel
  if (ctx.wantsSiteVisit || ctx.wantsBrochure || ctx.wantsCallback) {
    return { stage: 'lead_capture', showPropertyTypePicker: false, showLocationPicker: false };
  }

  // 1. Property Type
  if (!ctx.propertyType && !alreadyAskedType) {
    return { stage: 'ask_type', showPropertyTypePicker: true, showLocationPicker: false };
  }

  // 2. Location
  if (ctx.propertyType && !ctx.city && !alreadyAskedLocation) {
    return { stage: 'ask_location', showPropertyTypePicker: false, showLocationPicker: true };
  }

  // 3. BHK (Only needed for 'apartment')
  const needsBHK = ctx.propertyType && ['apartment'].includes(ctx.propertyType);
  if (ctx.propertyType && ctx.city && needsBHK && !ctx.bedrooms && !alreadyAskedBHK) {
    return { stage: 'ask_bhk', showPropertyTypePicker: false, showLocationPicker: false };
  }

  // 4. Budget
  if (ctx.propertyType && ctx.city && (ctx.bedrooms || !needsBHK) && !ctx.maxPrice && !alreadyAskedBudget) {
    return { stage: 'ask_budget', showPropertyTypePicker: false, showLocationPicker: false };
  }

  // 5. Show Properties
  const hasRequired = ctx.propertyType && ctx.city && (ctx.maxPrice || alreadyAskedBudget) && (!needsBHK || ctx.bedrooms || alreadyAskedBHK);
  if (hasRequired) {
    return { stage: 'show_properties', showPropertyTypePicker: false, showLocationPicker: false };
  }

  // Post-property (has all info already)
  if (messages.filter(m => m.role === 'assistant').length > 3) {
    return { stage: 'post_property', showPropertyTypePicker: false, showLocationPicker: false };
  }

  return { stage: 'ask_type', showPropertyTypePicker: true, showLocationPicker: false };
}

// ─── System Prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(
  propertyContext: string,
  stage: string,
  lang: 'hindi' | 'hinglish' | 'english',
  ctx: ReturnType<typeof extractConversationContext>
): string {
  const langRule =
    lang === 'hindi'    ? 'Reply ONLY in Hindi (Devanagari script). Formal but warm.'
    : lang === 'hinglish' ? 'Reply in Hinglish (Roman Hindi + English mix). Match user\'s tone exactly.'
    : 'Reply in clear, friendly English. Default language is ENGLISH unless user writes in Hindi.';

  const stageInstructions: Record<string, string> = {
    ask_type: `The user just opened the chat. Give a warm, exciting 2-line welcome, then ask what type of property they are looking for. DO NOT list the types — the UI shows buttons automatically. Keep it under 3 lines.`,
    ask_location: `User chose property type: ${ctx.propertyType || 'a property'}. Now ask which area/location they prefer. DO NOT list locations — the UI shows buttons. 1-2 lines only.`,
    ask_bhk: `User wants a ${ctx.propertyType} in ${ctx.city}. Now ask how many BHK/bedrooms they want. DO NOT list "2 BHK, 3 BHK, or 4 BHK" in your response text — the UI handles that with buttons. Keep it short.`,
    ask_budget: `User wants a ${ctx.bedrooms ? ctx.bedrooms + ' BHK ' : ''}${ctx.propertyType} in ${ctx.city}. Ask for their budget range. DO NOT list price ranges or bullet points in the text — the UI handles that with buttons. Keep it short.`,
    show_properties: `You have collected: Type=${ctx.propertyType}, Location=${ctx.city}, ${ctx.bedrooms ? 'BHK=' + ctx.bedrooms + ',' : ''} Budget=${ctx.maxPrice ? '₹' + ctx.maxPrice / 100000 + 'L' : 'flexible'}. Present the BEST matching property from the database with 4-5 highlights. End with: "Shall I send you images and full details?" Property cards are shown automatically below — do not list them again.`,
    lead_capture: `User wants a site visit / callback / brochure. Ask for their Name and Mobile Number. Keep it friendly and short.`,
    post_property: `Properties were shown. Now ask: "Would you like to see more properties here, or explore a different area?" Give 2 clear options.`,
  };

  return `You are Aria, a premium AI property sales assistant for SS Realty — Delhi NCR's top real estate platform (15+ years, 2000+ verified properties).

LANGUAGE RULE: ${langRule}

CURRENT TASK: ${stageInstructions[stage] || stageInstructions['ask_type']}

STRICT RULES:
- Keep every reply SHORT: max 4 lines
- End with exactly ONE question — never two
- NEVER repeat a question already answered in conversation history
- NEVER list property types, locations, BHK options, or budget ranges in text — buttons handle that
- Do not use ** for bold — use plain text with emojis
- No generic filler like "Great question!" or "Of course!"
- Be direct and natural like a knowledgeable friend, sounding as intelligent and helpful as Grok, Gemini, or ChatGPT.
- NEVER ask for BHK/bedrooms if the property type is Villa, Plot, Land, or Commercial. BHK is ONLY for Apartments/Flats.
- Enforce the user's budget strictly! If no properties exist under their budget in their chosen location, tell them the actual starting price range for that location and suggest our cheapest options starting at ₹52 Lakhs in Chhatarpur/Delhi NCR.

REAL DATABASE INVENTORY FACTS:
- Gwal Pahari properties (Amaryllis floors) start from ₹1.25 Crores.
- Chhatarpur/Delhi NCR properties start from ₹52 Lakhs (for a luxury 2 BHK).
- Gurugram properties start from ₹95 Lakhs.

SS REALTY COMPANY DETAILS:
- Head Office: Plot No-2, Dalmia Farm, Jonapur, New Delhi, Delhi 110047
- Regional Office: Noida (opened in 2016)
- Contact Number: +91 93110 59100
- Email: info@ssrealty.org
- Website: www.ssrealty.org

PROPERTY DATABASE (use when showing properties):
${propertyContext}`;
}

// ─── Smart fallback (no OpenAI) ───────────────────────────────────────────────
function fallbackResponse(
  stage: string,
  lang: 'hindi' | 'hinglish' | 'english',
  ctx: ReturnType<typeof extractConversationContext>,
  properties: PropertyDoc[]
): string {
  const hi  = lang === 'hindi';
  const mix = lang === 'hinglish';

  switch (stage) {
    case 'ask_type':
      if (hi)  return 'नमस्ते! 👋 SS Realty में आपका स्वागत है!\n\nआप किस तरह की प्रॉपर्टी खोज रहे हैं?';
      if (mix) return 'Hello! 👋 SS Realty mein aapka swagat hai!\n\nAap kaunsi property dhundh rahe hain?';
      return '✨ Welcome to SS Realty!\n\nI\'m Aria, your personal property expert. What type of property are you looking for?';

    case 'ask_location':
      if (hi)  return `बेहतरीन choice! 🏡 ${ctx.propertyType} के लिए हमारे पास शानदार options हैं!\n\nआप किस area में देखना चाहते हैं?`;
      if (mix) return `Great choice! 🏡 ${ctx.propertyType} ke liye hamari best properties hain!\n\nAap kis area mein property dekhna chahte hain?`;
      return `Great choice! 🏡 We have excellent ${ctx.propertyType} options.\n\nWhich area are you interested in?`;

    case 'ask_bhk':
      if (hi)  return `${ctx.city} में बहुत अच्छी ${ctx.propertyType} हैं! 🏘️\n\nआप कितने BHK का देखना चाहते हैं?`;
      if (mix) return `${ctx.city} mein bahut achi properties hain! 🏘️\n\nAap kitne BHK ka dekhna chahte hain?`;
      return `${ctx.city} has great options! 🏘️\n\nHow many bedrooms are you looking for?`;

    case 'ask_budget':
      if (hi)  return `${ctx.bedrooms ? ctx.bedrooms + ' BHK' : ctx.propertyType} ${ctx.city} में — बेहतरीन! 💰\n\nआपका budget range क्या है?`;
      if (mix) return `${ctx.bedrooms ? ctx.bedrooms + ' BHK' : ctx.propertyType} ${ctx.city} mein — perfect! 💰\n\nAapka budget range kya hai?`;
      return `Perfect! Now let's talk budget. 💰\n\nWhat's your price range?`;

    case 'show_properties': {
      const top = properties[0];
      if (!top) return lang === 'english'
        ? `I'm searching our database for the best match in ${ctx.city}. Our team will reach out with options shortly — may I have your contact details?`
        : `${ctx.city} mein aapke liye best options search kar raha hoon. Aapka contact number milega?`;
      const amenities = top.amenities.slice(0, 4).join(', ');
      if (hi)  return `हमारे पास आपके लिए एक बेहतरीन property है! 🏆\n\n${top.title} — ${top.location.city}\n• Price: ${formatPrice(top.price)}\n• ${top.features.bedrooms ? top.features.bedrooms + ' BHK, ' : ''}${top.features.area} ${top.features.areaUnit}\n• ${amenities}\n\nक्या आप इसकी images और details देखना चाहते हैं?`;
      if (mix) return `Hamare paas aapke liye ek best property hai! 🏆\n\n${top.title} — ${top.location.city}\n• Price: ${formatPrice(top.price)}\n• ${top.features.bedrooms ? top.features.bedrooms + ' BHK, ' : ''}${top.features.area} ${top.features.areaUnit}\n• ${amenities}\n\nKya aap iske images aur details dekhna chahenge?`;
      return `We found a great match for you! 🏆\n\n${top.title} — ${top.location.city}\n• ${formatPrice(top.price)} | ${top.features.bedrooms ? top.features.bedrooms + ' BHK | ' : ''}${top.features.area} ${top.features.areaUnit}\n• ${amenities}\n\nWould you like to see the images and full details?`;
    }

    case 'lead_capture':
      if (hi)  return `ज़रूर! 📞 हमारा property expert जल्द ही आपसे connect करेगा।\n\nकृपया अपना नाम और mobile number share करें।`;
      if (mix) return `Bilkul! 📞 Hamara property expert aapko jald connect karega.\n\nPlease apna naam aur mobile number share karein.`;
      return `Sure! 📞 Our property expert will connect with you shortly.\n\nCould you please share your name and mobile number?`;

    case 'post_property':
      if (hi)  return `क्या आप इसी area में और properties देखना चाहते हैं, या किसी और location में explore करें?`;
      if (mix) return `Kya aap isi area mein aur properties dekhna chahenge, ya kisi aur location mein explore karein?`;
      return `Would you like to see more properties in ${ctx.city}, or explore a different area?`;

    default:
      return lang === 'english'
        ? '✨ Welcome to SS Realty!\n\nI\'m Aria, your personal property expert. What type of property are you looking for?'
        : 'Hello! 👋 SS Realty mein aapka swagat hai!\n\nAap kaunsi property dhundh rahe hain?';
  }
}

// ─── OpenAI call ──────────────────────────────────────────────────────────────
async function callOpenAI(messages: ChatMessage[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return '';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
      max_tokens: 350,
      temperature: 0.6,
      presence_penalty: 0.4,
      frequency_penalty: 0.3,
    }),
  });
  if (!response.ok) return '';
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userMessage } = body as { messages: ChatMessage[]; userMessage: string };
    if (!userMessage?.trim()) return NextResponse.json({ success: false, error: 'No message' }, { status: 400 });

    const allMessages: ChatMessage[] = [...(messages || []), { role: 'user', content: userMessage }];

    // Detect language + extract what we know
    const lang = detectLanguage(allMessages);
    const ctx  = extractConversationContext(allMessages);
    const { stage, showPropertyTypePicker, showLocationPicker } = detectStage(allMessages);

    // Fetch matching properties only when needed
    let properties: PropertyDoc[] = [];
    if (['show_properties', 'post_property'].includes(stage)) {
      try {
        await connectDB();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: Record<string, any> = { status: 'available' };
        if (ctx.city) {
          filter['location.city'] = { $regex: ctx.city, $options: 'i' };
        }
        if (ctx.propertyType) {
          if (ctx.propertyType === 'villa') {
            filter.propertyType = { $in: ['villa', 'floor', 'house'] };
          } else {
            filter.propertyType = ctx.propertyType;
          }
        }
        if (ctx.bedrooms) {
          filter['features.bedrooms'] = ctx.bedrooms;
        }
        if (ctx.maxPrice) {
          filter.price = { $lte: ctx.maxPrice };
        }

        // Try strict match
        properties = await Property.find(filter).limit(6).lean() as unknown as PropertyDoc[];

        // If no strict match and we have a budget, try relaxing location but KEEPING budget and type/bedrooms
        if (!properties.length && ctx.maxPrice) {
          const relaxedLocation = { ...filter };
          delete relaxedLocation['location.city'];
          properties = await Property.find(relaxedLocation).limit(6).lean() as unknown as PropertyDoc[];
        }

        // If still no properties, let's relax budget slightly (up to 25% margin) but KEEPING location and type
        if (!properties.length && ctx.maxPrice) {
          const relaxedBudget = { ...filter };
          relaxedBudget.price = { $lte: ctx.maxPrice * 1.25 }; // up to 25% flexibility
          properties = await Property.find(relaxedBudget).limit(6).lean() as unknown as PropertyDoc[];
        }

        // If still no properties, let's relax both location AND budget slightly
        if (!properties.length && ctx.maxPrice) {
          const relaxedBoth = { ...filter };
          delete relaxedBoth['location.city'];
          relaxedBoth.price = { $lte: ctx.maxPrice * 1.25 };
          properties = await Property.find(relaxedBoth).limit(6).lean() as unknown as PropertyDoc[];
        }

        // If STILL no properties found, let's relax all constraints EXCEPT status='available' and sort by price ascending
        // to show the CHEAPEST options we have in our database.
        if (!properties.length) {
          const fallbackFilter: Record<string, any> = { status: 'available' };
          if (ctx.propertyType) {
            if (ctx.propertyType === 'villa') {
              fallbackFilter.propertyType = { $in: ['villa', 'floor', 'house'] };
            } else {
              fallbackFilter.propertyType = ctx.propertyType;
            }
          }
          properties = await Property.find(fallbackFilter).sort({ price: 1 }).limit(3).lean() as unknown as PropertyDoc[];
          
          if (!properties.length) {
            properties = await Property.find({ status: 'available' }).sort({ price: 1 }).limit(3).lean() as unknown as PropertyDoc[];
          }
        }
      } catch { /* DB unavailable */ }
    }

    const propertyContext = buildPropertyContext(properties);
    const systemPrompt = buildSystemPrompt(propertyContext, stage, lang, ctx);

    let aiResponse = await callOpenAI(allMessages, systemPrompt);
    if (!aiResponse) aiResponse = fallbackResponse(stage, lang, ctx, properties);

    const showLeadForm =
      stage === 'lead_capture' ||
      ctx.wantsSiteVisit || ctx.wantsCallback ||
      aiResponse.toLowerCase().includes('mobile number') ||
      aiResponse.toLowerCase().includes('contact detail');

    const shouldShowCards = stage === 'show_properties' && properties.length > 0;
    const showMoreButton  = shouldShowCards && properties.length > 1 && !ctx.wantsMoreProperties;
    const showBhkPicker   = stage === 'ask_bhk';
    const showBudgetPicker = stage === 'ask_budget';

    return NextResponse.json({
      success: true,
      message: aiResponse,
      properties: shouldShowCards
        ? properties.slice(0, ctx.wantsMoreProperties ? 4 : 1).map(p => ({
            _id: p._id,
            title: p.title,
            city: p.location.city,
            price: formatPrice(p.price),
            type: p.propertyType,
            bedrooms: p.features.bedrooms,
            area: `${p.features.area} ${p.features.areaUnit}`,
            status: p.status,
            image: p.images?.[0] || null,
            amenities: p.amenities.slice(0, 4),
          }))
        : [],
      showLeadForm,
      showMoreButton,
      showPropertyTypePicker,
      showLocationPicker,
      showBhkPicker,
      showBudgetPicker,
      stage,
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({
      success: true,
      message: `✨ Welcome to SS Realty!\n\nI'm Aria, your personal property expert. What type of property are you looking for?`,
      properties: [],
      showLeadForm: false,
      showPropertyTypePicker: true,
      showLocationPicker: false,
      showBhkPicker: false,
      showBudgetPicker: false,
      stage: 'ask_type',
    });
  }
}
