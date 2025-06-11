/**
 * Fetches content data for a given YouTube video ID.
 * @param {string} videoId - The ID of the YouTube video.
 * @param {string} apiKey - Your YouTube Data API key.
 * @returns {Promise<ContentData>} A promise that resolves with the video's content data.
 * @throws Will throw an error if the fetch operation fails or the API returns an error.
 */
export async function getYouTubeContentData(videoId: string, apiKey: string): Promise<ContentData> {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos")
  url.searchParams.set("part", "snippet")
  url.searchParams.set("id", videoId)
  url.searchParams.set("key", apiKey)

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.error?.message || response.statusText
      throw new Error(`YouTube API error: ${response.status} ${errorMessage}`)
    }

    const data = await response.json()
    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found.")
    }

    return data
  } catch (error) {
    throw new Error(`Failed to fetch YouTube content data: ${(error as Error).message}`)
  }
}

/**
 * Validates a YouTube video ID by checking if it's a valid video.
 * @param {string} videoId - The ID of the YouTube video to validate.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating if the video ID is valid.
 */
export async function isValidYouTubeVideoId(videoId: string): Promise<boolean> {
  const url = new URL("https://www.youtube.com/oembed")
  url.searchParams.set("url", `https://www.youtube.com/watch?v=${videoId}`)
  url.searchParams.set("format", "json")

  try {
    const response = await fetch(url.toString())
    return response.ok
  } catch (error) {
    console.error(
      `Failed to validate YouTube video ID due to a network error: ${(error as Error).message}`
    )
    return false
  }
}
