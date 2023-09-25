export interface GenerateListingDescriptionRequest{
  head: {
    max_tokens: number,
    temperature: number
  };
  description: {
    prompt: string,
    max_tokens: number,
    temperature: number
  }
}