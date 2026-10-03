/** A format exporter: turns canonical editor HTML into a downloadable Blob. */
export interface Exporter {
  export: (canonicalHtml: string) => Promise<Blob>;
}

/** A format importer: turns a user-supplied File into canonical editor HTML. */
export interface Importer {
  import: (file: File) => Promise<string>;
}
