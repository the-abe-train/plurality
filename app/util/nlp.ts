import { MongoClient } from "mongodb";
import lemmatize from "wink-lemmatizer";
import { votesBySurvey } from "~/db/queries";
import { RankedVote, VoteAggregation } from "~/db/schemas";
import { capitalizeFirstLetter } from "./text";

export function getLemma(word: string | number): string {
  if (typeof word === "number") return getLemma(String(word));
  return capitalizeFirstLetter(lemmatize.noun(word.trim().toLowerCase()));
}

export async function surveyAnswers(client: MongoClient, surveyId: number) {
  const responses = await votesBySurvey(client, surveyId);
  const lemmatizedResponses = responses.reduce((output, response) => {
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
  }, [] as VoteAggregation[]);

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
