import { orderBy } from "lodash";
import jsonData from './kitties.json';

export async function getKitties() {
  //TODO:
  // - investigate the json data when you have imported it, use console.log( ... )
  // - write a loop that transforms the kitty data into a format that we want
  // - you can use jsonData.map( ( o ) => { return { ... } } ) to transform the data
  // - we would want to parse the metadata to json from a string we get from the dump
  // - also we want a simple kitty id

  const realKittyData = jsonData

  //TODO: implement sorting of the kitty data, you can use lodas orderBy function
  const sortedData = realKittyData

  return {
    kitties: sortedData,
  };
}
