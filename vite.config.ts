
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Cache app shell for offline usage
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}'],
        cleanupOutdatedCaches: true,
        
        // Configure caching strategies
        runtimeCaching: [
          {
            // NetworkFirst strategy for Supabase API calls
            urlPattern: ({ url }: { url: URL }) => {
              const supabaseUrl = new URL("https://ygjzljotnkjadiolbiwk.supabase.co");
              return url.hostname === supabaseUrl.hostname;
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              networkTimeoutSeconds: 10,
              backgroundSync: {
                name: 'supabase-api-queue',
                options: {
                  maxRetentionTime: 24 * 60 // Retry for up to 24 hours (in minutes)
                }
              }
            }
          },
          {
            // Cache workout data with background sync
            urlPattern: ({ url }: { url: URL }) => {
              return url.pathname.includes('workout_logs');
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'workout-data-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              backgroundSync: {
                name: 'workout-data-queue',
                options: {
                  maxRetentionTime: 24 * 60 // Retry for up to 24 hours (in minutes)
                }
              }
            }
          },
          {
            // Cache other API responses
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              }
            }
          },
          {
            // Cache fonts from Google
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              }
            }
          },
          {
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              }
            }
          },
          {
            // Cache static assets
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              }
            }
          }
        ]
      },
      // PWA manifest configuration
      manifest: {
        name: "Strength Stats Navigator",
        short_name: "Strength Stats",
        description: "Track and analyze your fitness progress",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "48x48",
            type: "image/x-icon"
          },
          {
            src: "/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
      // Handle update notifications
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
