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
      return this.tweetClient.fetchTweets(followerIds);
    }
  }
  
  export default TimelineService;
  