import { MongoClient } from "mongodb";
import lemmatize from "wink-lemmatizer";
import { votesBySurvey } from "~/db/queries";
import { VoteAggregation } from "~/db/schemas";
import { capitalizeFirstLetter } from "./text";

export function getLemma(word: string) {
  return capitalizeFirstLetter(lemmatize.noun(word.toLowerCase()));
}

export async function surveyAnswers(client: MongoClient, surveyId: number) {
  const responses = await votesBySurvey(client, surveyId);
  const lemmatizedResponses = responses.reduce((output, response) => {
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

  const rankedResponses = lemmatizedResponses
    .sort((a, z) => z.votes - a.votes)
    .map((resp, idx) => {
      return { ...resp, ranking: idx + 1 };
    });

  console.log(rankedResponses);
  console.log(lemmatize.noun("Women"), lemmatize.noun("Woman"));
  console.log(lemmatize.noun("banana"), lemmatize.noun("bananas"));
  return rankedResponses;
}
