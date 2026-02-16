import { ApiProperty } from '@nestjs/swagger';

export class GameReactionStatsDto {
  @ApiProperty({ description: 'Number of likes' })
  likeCount: number;

  @ApiProperty({ description: 'Number of dislikes' })
  dislikeCount: number;

  @ApiProperty({
    description: 'Current user reaction',
    enum: ['like', 'dislike', null],
    nullable: true,
  })
  userReaction: 'like' | 'dislike' | null;
}

export class ReactionResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({
    description: 'Reaction type',
    enum: ['like', 'dislike', null],
    nullable: true,
  })
  reactionType: 'like' | 'dislike' | null;
}
