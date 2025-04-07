export async function getPRFilesAsRawCode(context: any): Promise<Record<string, string>> {
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
            console.warn(`Skipping ${filePath} because it is of type "${contentData.type}"`);
            return;
          }

          // Decode base64 content if available
          if ("content" in contentData && contentData.content) {
              fileMap[filePath] = Buffer.from(contentData.content, "base64").toString("utf-8");
          }
        } catch (err) {
          // Log and continue processing other files if an error occurs for this file
          console.error(`Error processing file "${filePath}":`, err);
        }
      })
    );
    console.info(fileMap)
    return fileMap;
  } catch (error) {
    console.error("Error fetching PR files:", error);
    throw error;
  }
}

function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatJsonForGithubComment(json: any): string {
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