"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";

const createEmotionCache = () => {
  return createCache({ key: "css", prepend: true });
};

export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = React.useState(() => createEmotionCache());
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(cache);

  useServerInsertedHTML(() => {
    const chunks = extractCriticalToChunks("");
    return (
      <style
        data-emotion-css={chunks.styles.map((s) => s.key).join(" ")}
        dangerouslySetInnerHTML={{
          __html: constructStyleTagsFromChunks(chunks),
        }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
