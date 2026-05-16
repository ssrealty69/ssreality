import { redirect } from 'next/navigation';

export default function BrochuresPage() {
  // Redirect to the PDF file located in the public folder
  redirect('/Arch%20Brouchre.pdf');
}
