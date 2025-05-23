export async function getYouTubeContentData(videoId: string, apiKey: string): Promise<ContentData> {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
  try {
    console.log(`Fetching YouTube content data from URL: ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    throw new Error(`Failed to fetch YouTube content data: ${(error as Error).message}`)
  }
}
