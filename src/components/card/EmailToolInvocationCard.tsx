import type { ToolUIPart } from "ai";
import { EnvelopeOpen, ShareFat } from "@phosphor-icons/react";
import { Button } from "@/components/button/Button";

interface PartInput {
  to?: string;
  subject?: string;
  body?: string;
  [key: string]: unknown;
}

interface EmailToolInvocationCardProps {
  toolUIPart: ToolUIPart;
  toolCallId: string;
}

/**
 * Generate a mailto link with encoded parameters
 */
const generateMailtoLink = (to: string, subject: string, body: string) => {
  const encodedBody = encodeURIComponent(body);
  const encodedSubject = encodeURIComponent(subject);
  return `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
};

/**
 * Specialized component for email tool invocations
 * Contains email preview and a mailto link to open in email client
 */
export function EmailToolInvocationCard({
  toolUIPart
}: EmailToolInvocationCardProps) {
  const input = toolUIPart.input as PartInput;

  const handleSendEmail = () => {
    // Generate mailto link and open email client
    const mailtoLink = generateMailtoLink(
      input.to || "",
      input.subject || "",
      input.body || ""
    );
    window.location.href = mailtoLink;
  };

  return (
    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800">
      <p className="text-xs text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
        <EnvelopeOpen size={14} />
        Email Preview
      </p>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-semibold text-amber-900 dark:text-amber-100">
            To:{" "}
          </span>
          <span className="text-amber-800 dark:text-amber-200">{input.to}</span>
        </div>

        <div>
          <span className="font-semibold text-amber-900 dark:text-amber-100">
            Subject:{" "}
          </span>
          <span className="text-amber-800 dark:text-amber-200">
            {input.subject}
          </span>
        </div>

        <div>
          <span className="font-semibold text-amber-900 dark:text-amber-100">
            Body:{" "}
          </span>
          <p className="text-amber-800 dark:text-amber-200 whitespace-pre-wrap mt-1 pl-2 border-l-2 border-amber-300">
            {input.body}
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <Button variant="primary" size="sm" onClick={handleSendEmail}>
          <ShareFat size={14} />
          Open in Email Client
        </Button>
      </div>
    </div>
  );
}
