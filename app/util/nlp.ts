import { MongoClient } from "mongodb";
import lemmatize from "wink-lemmatizer";
import { votesBySurvey } from "~/db/queries";
import { capitalizeFirstLetter } from "./text";
import Typo from "typo-js";

const spellcheckIgnore = require("../maps/spellcheck_ignore.json") as string[];
const lemmaIgnore = require("../maps/lemma_ignore.json") as string[];
const acronyms = require("../maps/acronyms.json") as Record<string, string>;

export function getTypo(response: string) {
  if (spellcheckIgnore.includes(response)) return [];
  // @ts-ignore
  const dictionary = new Typo("en_US");
  return dictionary.suggest(response) as string[];
}

export function getLemma(word: string | number): string {
  if (typeof word === "number") return String(word);
  let trimmed = word.trim().toLowerCase();
  if (acronyms.hasOwnProperty(trimmed)) trimmed = acronyms[trimmed];
  if (lemmaIgnore.includes(trimmed)) return capitalizeFirstLetter(trimmed);
  const noun = lemmatize.noun(trimmed);
  if (noun !== trimmed) return capitalizeFirstLetter(noun);
  const verb = lemmatize.verb(trimmed);
  if (verb !== trimmed) return capitalizeFirstLetter(verb);
  const adjective = lemmatize.adjective(trimmed);
  if (adjective !== trimmed) return capitalizeFirstLetter(adjective);
  return capitalizeFirstLetter(trimmed);
}

export async function surveyAnswers(client: MongoClient, surveyId: number) {
  const responses = await votesBySurvey(client, surveyId);
  const lemmatizedResponses = responses.reduce(
    (output: VoteAggregation[], response) => {
      if (typeof response === "number") return [...output, response];
      const lemmatized = { ...response, _id: getLemma(response._id) };
      const existingResponse = output.find((r) => r._id === lemmatized._id);
      if (existingResponse) {
        const existingIdx = output.findIndex((r) => r._id === lemmatized._id);
        existingResponse["votes"] += lemmatized.votes;
        output.splice(existingIdx, 1, existingResponse);
        return output;
      }
      return [...output, lemmatized];
    },
    []
  ) as VoteAggregation[];

  const rankedResponses: RankedVote[] = lemmatizedResponses
    .sort((a, z) => {
      const voteDiff = z.votes - a.votes;
      if (voteDiff !== 0) return voteDiff;
      return a._id.localeCompare(z._id);
    })
    .map((resp, idx) => {
      return { ...resp, ranking: idx + 1 };
    });

  return rankedResponses;
}
