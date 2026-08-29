import { allTopics, topicsByCategory, topicsBySubcategory } from '$lib/content';

export interface HomeData {
  allTopics: typeof allTopics;
  topicsByCategory: typeof topicsByCategory;
  topicsBySubcategory: typeof topicsBySubcategory;
}

export function load(): HomeData {
  return { allTopics, topicsByCategory, topicsBySubcategory };
}