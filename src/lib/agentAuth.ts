import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentSession from '@/models/AgentSession';
import Agent, { IAgent } from '@/models/Agent';

export interface AuthResult {
  success: boolean;
  agentId?: string;
  agent?: IAgent;
  error?: string;
}

export async function verifyAgentToken(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Unauthorized: No token provided' };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return { success: false, error: 'Unauthorized: Empty token' };
  }

  await connectDB();
  const now = new Date();
  const session = await AgentSession.findOne({ token, expiresAt: { $gt: now } });
  if (!session) {
    return { success: false, error: 'Unauthorized: Invalid or expired session' };
  }

  const agent = await Agent.findById(session.agentId);
  if (!agent || !agent.isActive) {
    return { success: false, error: 'Unauthorized: Agent not found or inactive' };
  }

  return { success: true, agentId: session.agentId, agent };
}
