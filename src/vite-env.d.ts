/// <reference types="vite/client" />

declare module '*.md?url' {
  const src: string;
  export default src;
}

declare module '*.pdf?url' {
  const src: string;
  export default src;
}
