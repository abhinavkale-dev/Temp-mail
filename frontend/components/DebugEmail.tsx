"use client";
import { useState } from 'react';
import { plainTextToHtml } from '../lib/plainTextToHtml';

export function DebugEmail() {
  const [testHtml] = useState(`
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333333; font-size: 28px; margin-bottom: 10px;">Confirm Your Account</h1>
        <p style="color: #666666; font-size: 16px; line-height: 1.5;">
          Thank you for signing up for Resend. To confirm your account, please click the button below.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://example.com/confirm" 
           style="display: inline-block; padding: 14px 28px; background-color: #000000; color: #ffffff; 
                  text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Confirm Account
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; color: #999999; font-size: 14px;">
        <p>2261 Market Street #5039<br>San Francisco, CA 94114</p>
      </div>
    </div>
  `);

  const [testPlainText] = useState(`Thank you for signing up for Resend. To confirm your account, please click the button below.

Confirm Account

https://resend.com/auth/confirm-account?token=59e668d055fc94965ae49d5a83b71301e18e9e78cc4b1e336d9e0011&redirect_to=/onboarding

2261 Market Street #5039
San Francisco, CA 94114`);

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-black">HTML Email Debug Test</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Raw HTML:</h3>
        <pre className="bg-gray-200 p-3 rounded text-xs overflow-x-auto text-black">
          {testHtml}
        </pre>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Rendered with email-content class:</h3>
        <div className="email-content-wrapper border border-gray-300 rounded p-4">
          <div 
            className="email-content"
            dangerouslySetInnerHTML={{ __html: testHtml }}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Rendered without special styling:</h3>
        <div className="border border-gray-300 rounded p-4">
          <div 
            dangerouslySetInnerHTML={{ __html: testHtml }}
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Plain Text Input (like your actual email):</h3>
        <pre className="bg-gray-200 p-3 rounded text-xs overflow-x-auto text-black">
          {testPlainText}
        </pre>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Generated HTML from Plain Text:</h3>
        <pre className="bg-gray-200 p-3 rounded text-xs overflow-x-auto text-black max-h-48">
          {plainTextToHtml(testPlainText)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Plain Text → Rich HTML (CTA Detection) - Rendered:</h3>
        <div className="email-content-wrapper border border-gray-300 rounded p-4">
          <div 
            className="email-content"
            dangerouslySetInnerHTML={{ __html: plainTextToHtml(testPlainText) }}
          />
        </div>
      </div>
    </div>
  );
} 