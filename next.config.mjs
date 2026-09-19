export default phase => ({ reactStrictMode: true, distDir: phase === 'phase-development-server' ? '.next-dev' : '.next' });
