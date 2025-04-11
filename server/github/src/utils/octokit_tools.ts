import { BlastRadiusIssue } from "../types/index.js"
import { Logger } from "./logger.js";

export async function getPRFilesAsRawCode(context: any, logger: Logger) {
  const fileMap: Record<string, string> = {};

  // Validate and extract pull request data from the context.
  const pr = context.payload && (context.payload.pull_request || context.payload.data);
  if (!pr || !pr.number || !pr.head || !pr.head.sha) {
    throw new Error("Invalid pull request payload. Ensure that 'number' and 'head.sha' are available.");
  }

  try {
    // Step 1: Get files in the pull request
    const { data: files } = await context.octokit.pulls.listFiles({
      ...context.repo(),
      pull_number: pr.number,
    });

    // Process file content fetches concurrently
    await Promise.all(
      files.map(async (file: any) => {
        const filePath = file.filename;

        // Skip deleted files
        if (file.status === "removed" || filePath.endsWith(".lock")) return;

        try {
          // Step 2: Get the file content from the PR's head commit SHA
          const { data: contentData } = await context.octokit.repos.getContent({
            ...context.repo(),
            path: filePath,
            ref: pr.head.sha,
          });

          // Ensure that the content represents a file and not a directory or symlink
          if (contentData.type !== "file") {
            logger.warn(`Skipping ${filePath} because it is of type "${contentData.type}"`)
            return;
          }

          // Decode base64 content if available
          if ("content" in contentData && contentData.content) {
              fileMap[filePath] = Buffer.from(contentData.content, "base64").toString("utf-8");
          }
        } catch (err) {
          // Log and continue processing other files if an error occurs for this file
          logger.error(`Error processing file "${filePath}":`, err);
        }
      })
    );
    return fileMap;
  } catch (error) {
    logger.error("Error fetching PR files:", error)
    return {}
  }
}

function capitalizeWords(str: string) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatJsonForGithubComment(json: any) {
  const formatKey = (key: string) => key.replace(/_/g, ' ').toUpperCase();

  let comment = '';

  for (let key in json) {
    // Main key as Heading
    const formattedKey = formatKey(key);
    comment += `## ${capitalizeWords(formattedKey)}\n`;

    // Loop through the sub-keys (did_right, did_wrong, ambiguous)
    for (let subKey in json[key]) {
      const formattedSubKey = formatKey(subKey);
      const emojiMap: { [key: string]: string } = {
        'DID RIGHT': '✅',
        'DID WRONG': '❌',
        'AMBIGUOUS': '❓'
      };
      const emoji = emojiMap[formattedSubKey] || '';

      comment += `- **${emoji} ${capitalizeWords(formattedSubKey)}**: ${json[key][subKey]}\n\n`;
    }
  }

  return comment;
}

export function issuesToMarkdown(issues: BlastRadiusIssue[]) {
    const title = `## 💥 Blast Radius 💥\n\n`;
    return title + issues
        .map((issue) => {
            return `### [${issue.key}](${issue.URL}) - ${issue.issue_type}\n\n` +
                `**Summary:** ${issue.summary}\n\n` +
                (issue.description ? `**Description:** ${issue.description}\n\n` : '');
        })
        .join('\n---\n\n');
}

export function convertToSimpleJiraFormat(json: any) {
  const formatKey = (key: string) => key.replace(/_/g, ' ').toUpperCase();

  let comment = '';

  for (let key in json) {
    // Main key as a heading-like format
    const formattedKey = formatKey(key);
    comment += `${formattedKey}\n`; // Newline after the key

    // Loop through the sub-keys (did_right, did_wrong, ambiguous)
    for (let subKey in json[key]) {
      const formattedSubKey = formatKey(subKey);
      const emojiMap: { [key: string]: string } = {
        'DID RIGHT': '✅',
        'DID WRONG': '❌',
        'AMBIGUOUS': '❓'
      };
      const emoji = emojiMap[formattedSubKey] || '';

      // Add sub-key items with space and emojis, with a new line between each
      comment += `${emoji} ${capitalizeWords(formattedSubKey)}: ${json[key][subKey]}\n\n`;
    }

    // Add extra space for separation between sections
    comment += '\n';
  }

  return comment;
}

export function convertMarkdownToPlainText(markdown: string) {
  // Remove Markdown code blocks (e.g., ```markdown ... ```)
  let plainText = markdown.replace(/```[^\n]*\n([\s\S]*?)\n```/g, '$1'); // Remove code blocks

  // Remove Markdown headers (e.g., ## Heading -> Heading)
  plainText = plainText.replace(/^#+\s*(.*)$/gm, (_, content) => content);

  // Remove bold and italic formatting (e.g., **bold** -> bold, *italic* -> italic)
  plainText = plainText.replace(/\*\*([^\*]+)\*\*/g, '$1');  // Remove bold
  plainText = plainText.replace(/\*([^\*]+)\*/g, '$1');  // Remove italic

  // Remove links (e.g., [text](url) -> text)
  plainText = plainText.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // Replace markdown-style lists (e.g., - item -> item)
  plainText = plainText.replace(/^-\s*(.*)$/gm, '$1');

  // Normalize multiple new lines to a single one and ensure proper spacing
  plainText = plainText.replace(/\n+/g, '\n');

  return plainText.trim();
}