import FollowService from "follow/servers";
import { Tweet, TweetService } from "tweet/service";

class TimelineService {
  private followClient: FollowService;
  private tweetClient: TweetService;

  constructor(followClient: FollowService, tweetClient: TweetService) {
    this.followClient = followClient;
    this.tweetClient = tweetClient;
  }

  async getTimeline(userId: string): Promise<Tweet[]> {
    const followerIds: string[] = await this.followClient.getFollowing(userId);
    followerIds.push(userId);
    const tweetsFromFollowers = await this.tweetClient.fetchTweets(followerIds);
    
    const taggedTweets = await this.tweetClient.fetchTweetsByTaggedUser(userId);
    
    const allTweets = [...tweetsFromFollowers, ...taggedTweets];
    const sortedTweets = allTweets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return sortedTweets;
  }

  async getPublicFeed(): Promise<Tweet[]> {
    return this.tweetClient.fetchAllTweets();
  }
}

export default TimelineService;
