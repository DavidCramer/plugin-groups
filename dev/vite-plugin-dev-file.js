import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Vite plugin that creates a file when the dev server starts
 * and deletes it when the server stops.
 * 
 * @param {Object} options - Plugin options
 * @param {string} options.filePath - Path to the file to create (relative to project root)
 * @param {string|Function} options.content - Content to write to the file (default: actual port number)
 * @returns {import('vite').Plugin}
 */
export default function devFilePlugin(options = {}) {
    const {
        filePath = '.dev-server-running',
        content
    } = options;

    let resolvedPath;
    let cleanupRegistered = false;

    const cleanup = () => {
        try {
            if (existsSync(resolvedPath)) {
                unlinkSync(resolvedPath);
                console.log(`[vite-plugin-dev-file] Deleted: ${resolvedPath}`);
            }
        } catch (error) {
            console.error(`[vite-plugin-dev-file] Failed to delete file:`, error);
        }
    };

    return {
        name: 'vite-plugin-dev-file',

        configResolved(config) {
            // Resolve the file path relative to the project root
            resolvedPath = resolve(config.root, filePath);
        },

        configureServer(server) {
            // Wait for server to be listening to get the actual port
            server.httpServer?.once('listening', () => {
                const address = server.httpServer?.address();
                const port = typeof address === 'object' ? address?.port : null;

                // Use custom content if provided, otherwise default to port number
                const fileContent = typeof content === 'function'
                    ? content(port)
                    : (content !== undefined ? content : String(port || ''));

                try {
                    writeFileSync(resolvedPath, fileContent, 'utf-8');
                    console.log(`[vite-plugin-dev-file] Created: ${resolvedPath}`);
                } catch (error) {
                    console.error(`[vite-plugin-dev-file] Failed to create file:`, error);
                }
            });

            // Register cleanup handlers for process termination (only once)
            if (!cleanupRegistered) {
                cleanupRegistered = true;

                // Handle Ctrl+C
                process.on('SIGINT', () => {
                    cleanup();
                    process.exit(0);
                });

                // Handle kill command
                process.on('SIGTERM', () => {
                    cleanup();
                    process.exit(0);
                });

                // Handle normal exit
                process.on('exit', cleanup);
            }
        },

        closeBundle() {
            // Also cleanup on normal server close
            cleanup();
        }
    };
}