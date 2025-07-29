/**
 * Converts plain text to HTML with basic formatting
 * Detects URLs and converts them to clickable links
 * Preserves line breaks and paragraphs
 */
export function plainTextToHtml(text: string): string {
  if (!text) return '';

  // Escape HTML entities first
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  html = html.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">$1</a>');

  // Convert email addresses to mailto links
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  html = html.replace(emailRegex, '<a href="mailto:$1" style="color: #0066cc; text-decoration: underline;">$1</a>');

  // Convert line breaks to <br> tags
  html = html.replace(/\n/g, '<br>');

  // Convert double line breaks to paragraphs
  html = html.replace(/(<br>\s*){2,}/g, '</p><p>');

  // Wrap in paragraph tags if not already wrapped
  if (!html.startsWith('<p>')) {
    html = '<p>' + html + '</p>';
  }

  // Add basic styling for better email rendering
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      ${html}
    </div>
  `;
}
