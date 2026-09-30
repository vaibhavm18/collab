// Runs before first paint so the correct theme class is on <html> and there is no
// flash of the wrong theme. Must stay inline and blocking — a client component
// effect would run too late.
const themeScript = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function ThemeScript() {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: inline blocking theme script
    <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  );
}
