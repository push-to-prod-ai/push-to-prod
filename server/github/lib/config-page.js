export function setupConfigPage(app) {
    // Instead of using app.router, we'll export these routes to be used with Express
    const routes = {
        getSetupPage: async (_req, res) => {
            const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Push to Prod Setup</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body class="bg-gray-50 p-8">
            <div class="max-w-2xl mx-auto">
              <h1 class="text-3xl font-bold mb-8">Push to Prod Configuration</h1>
              
              <form action="/setup/save" method="POST" class="space-y-6">
                <div>
                  <label class="block text-sm font-medium">Jira Domain</label>
                  <input type="text" name="jiraDomain" 
                    placeholder="your-company.atlassian.net"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>

                <div>
                  <label class="block text-sm font-medium">Jira Email</label>
                  <input type="email" name="jiraEmail" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>

                <div>
                  <label class="block text-sm font-medium">Jira API Token</label>
                  <input type="password" name="jiraApiToken"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>

                <div>
                  <label class="block text-sm font-medium">Default Jira Project Key</label>
                  <input type="text" name="jiraProjectKey" 
                    placeholder="PROJ"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>

                <button type="submit" 
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Save Configuration
                </button>
              </form>
            </div>
          </body>
        </html>
      `;
            res.send(html);
        },
        handleSetupSave: async (req, res) => {
            const { jiraDomain, jiraEmail, jiraApiToken, jiraProjectKey } = req.body;
            try {
                await app.storage.set('jiraConfig', {
                    domain: jiraDomain,
                    email: jiraEmail,
                    apiToken: jiraApiToken,
                    projectKey: jiraProjectKey
                });
                res.redirect('/setup/success');
            }
            catch (error) {
                res.status(500).send('Error saving configuration');
            }
        }
    };
    return routes;
}
//# sourceMappingURL=config-page.js.map