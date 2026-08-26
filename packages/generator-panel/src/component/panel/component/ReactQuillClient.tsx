import React, { useEffect, useState } from "react";

type ReactQuillType = typeof import("react-quill-new");

export interface ReactQuillClientProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  theme?: string;
  modules?: any;
  className?: string;
}

/**
 * SSR-safe wrapper for ReactQuill that lazy-loads the editor only in the browser.
 * 
 * This component is safe to use in SSR environments like Remix, Next.js, etc.
 * During server-side rendering, it renders a placeholder div.
 * On the client, it loads react-quill dynamically and renders the full editor.
 */
export const ReactQuillClient: React.FC<ReactQuillClientProps> = (props) => {
  const [ReactQuill, setReactQuill] = useState<ReactQuillType["default"] | null>(null);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Dynamically import react-quill and its styles
      const [mod] = await Promise.all([
        import("react-quill-new"),
        import("react-quill-new/dist/quill.snow.css")
      ]);
      
      if (!cancelled) {
        setReactQuill(() => mod.default);
        setStylesLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // SSR + first client render: consistent placeholder
  if (!ReactQuill || !stylesLoaded) {
    return (
      <div 
        className={`text-gray-500 p-4 border border-gray-300 rounded min-h-[200px] ${props.className || ""}`}
        style={{ fontFamily: "inherit" }}
      >
        Loading editor...
      </div>
    );
  }

  return <ReactQuill {...props} />;
};
