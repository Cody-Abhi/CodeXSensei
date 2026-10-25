/**
 * Self-hosted fonts (decision D6). Importing these bundles the woff2 files into
 * the client build so they load same-origin under the strict CSP. Only the
 * weights actually used by the design system are imported.
 */
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
