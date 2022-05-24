declare module "wink-lemmatizer" {
  function adjective(str: string): string;
  function noun(str: string): string;
  function verb(str: string): string;
}

declare module "typo-js" {
  class Typo {
    constructor(lang_code: string);
    check(word: string): boolean;
  }
}
