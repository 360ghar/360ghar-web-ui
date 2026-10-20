/** Loads sharp on demand. sharp is not a dependency of this project yet, so a missing package gives a clear message and exit code 3. */
export async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch {
    console.error('This script needs the "sharp" package, which is not installed.\nInstall it with:  pnpm add -D sharp\nThen run the script again.');
    process.exit(3);
  }
}
