'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { reactToNews } from '@/app/news/actions';

interface NewsReactionsProps {
  newsId: string;
  initialLikes: number;
  initialDislikes: number;
}

export function NewsReactions({ newsId, initialLikes, initialDislikes }: NewsReactionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`news-reaction-${newsId}`) as 'like' | 'dislike' | null;
    if (saved === 'like' || saved === 'dislike') {
      setUserReaction(saved);
    }
  }, [newsId]);

  const handleReact = async (type: 'like' | 'dislike') => {
    if (isPending) return;
    setIsPending(true);

    let likeDelta = 0;
    let dislikeDelta = 0;
    let newReaction: 'like' | 'dislike' | null = null;

    if (type === 'like') {
      if (userReaction === 'like') {
        // Cancel like
        likeDelta = -1;
        newReaction = null;
      } else if (userReaction === 'dislike') {
        // Change dislike to like
        likeDelta = 1;
        dislikeDelta = -1;
        newReaction = 'like';
      } else {
        // New like
        likeDelta = 1;
        newReaction = 'like';
      }
    } else {
      if (userReaction === 'dislike') {
        // Cancel dislike
        dislikeDelta = -1;
        newReaction = null;
      } else if (userReaction === 'like') {
        // Change like to dislike
        likeDelta = -1;
        dislikeDelta = 1;
        newReaction = 'dislike';
      } else {
        // New dislike
        dislikeDelta = 1;
        newReaction = 'dislike';
      }
    }

    // Optimistic UI update
    setLikes(prev => Math.max(0, prev + likeDelta));
    setDislikes(prev => Math.max(0, prev + dislikeDelta));
    setUserReaction(newReaction);

    try {
      if (newReaction) {
        localStorage.setItem(`news-reaction-${newsId}`, newReaction);
      } else {
        localStorage.removeItem(`news-reaction-${newsId}`);
      }

      await reactToNews(newsId, likeDelta, dislikeDelta);
    } catch (err) {
      console.error('Failed to react to news:', err);
      // Revert on error
      setLikes(prev => Math.max(0, prev - likeDelta));
      setDislikes(prev => Math.max(0, prev - dislikeDelta));
      setUserReaction(userReaction);
      if (userReaction) {
        localStorage.setItem(`news-reaction-${newsId}`, userReaction);
      } else {
        localStorage.removeItem(`news-reaction-${newsId}`);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="news-reactions-container">
      <span className="news-reactions-title">Co sądzisz o tym newsie?</span>
      <div className="news-reactions-buttons">
        <button
          onClick={() => handleReact('like')}
          disabled={isPending}
          className={`news-reactions-btn news-reactions-btn--like ${userReaction === 'like' ? 'news-reactions-btn--active' : ''}`}
          aria-label="Polub"
        >
          <ThumbsUp size={18} />
          <span className="news-reactions-count">{likes}</span>
        </button>
        <button
          onClick={() => handleReact('dislike')}
          disabled={isPending}
          className={`news-reactions-btn news-reactions-btn--dislike ${userReaction === 'dislike' ? 'news-reactions-btn--active' : ''}`}
          aria-label="Nie polub"
        >
          <ThumbsDown size={18} />
          <span className="news-reactions-count">{dislikes}</span>
        </button>
      </div>
    </div>
  );
}
