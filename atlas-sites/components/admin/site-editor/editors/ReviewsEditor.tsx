'use client';

import { SectionConfig } from '@/lib/site-config/types';
import { FormField } from '../FormField';
import { Plus, Trash2, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useState } from 'react';

interface ReviewsEditorProps {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  text: string;
  date?: string;
  source?: string;
}

interface EditorContent {
  headline?: string;
  subheadline?: string;
  reviews?: ReviewItem[];
  showGoogleLink?: boolean;
  googleLinkText?: string;
}

interface EditorStyles {
  layout?: 'carousel' | 'grid' | 'list';
  columns?: 2 | 3;
  showRating?: boolean;
  showDate?: boolean;
}

export function ReviewsEditor({ section, onUpdate }: ReviewsEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (section as any).content as EditorContent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles = ((section as any).styles || {}) as EditorStyles;

  const reviews = content.reviews || [];

  const updateContent = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ content: { ...content, [key]: value } } as any);
  };

  const updateStyles = (key: string, value: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate({ styles: { ...styles, [key]: value } } as any);
  };

  const updateReview = (index: number, updates: Partial<ReviewItem>) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], ...updates };
    updateContent('reviews', newReviews);
  };

  const addReview = () => {
    const newReviews = [
      ...reviews,
      {
        id: `review-${Date.now()}`,
        author: 'Customer Name',
        rating: 5,
        text: 'Review text goes here...',
        source: 'Google',
      },
    ];
    updateContent('reviews', newReviews);
    setExpandedIndex(newReviews.length - 1);
  };

  const removeReview = (index: number) => {
    const newReviews = reviews.filter((_, i) => i !== index);
    updateContent('reviews', newReviews);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Section Header */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Section Header</h4>
        <div className="space-y-4">
          <FormField label="Headline">
            <input
              type="text"
              value={content.headline || ''}
              onChange={(e) => updateContent('headline', e.target.value)}
              placeholder="What Our Customers Say"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Subheadline">
            <input
              type="text"
              value={content.subheadline || ''}
              onChange={(e) => updateContent('subheadline', e.target.value)}
              placeholder="See why customers choose us"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium text-sm">Reviews</h4>
          <button
            onClick={addReview}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Review
          </button>
        </div>

        <div className="space-y-2">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden"
            >
              {/* Collapsed header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-zinc-800/80 transition-colors"
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">
                      {review.author}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeReview(index);
                  }}
                  className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedIndex === index ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </div>

              {/* Expanded content */}
              {expandedIndex === index && (
                <div className="p-3 pt-0 space-y-4 border-t border-zinc-700/50">
                  <FormField label="Author Name">
                    <input
                      type="text"
                      value={review.author}
                      onChange={(e) =>
                        updateReview(index, { author: e.target.value })
                      }
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>

                  <FormField label="Rating">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => updateReview(index, { rating: star })}
                          className="p-1"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-600 hover:text-amber-400'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Review Text">
                    <textarea
                      value={review.text}
                      onChange={(e) =>
                        updateReview(index, { text: e.target.value })
                      }
                      rows={3}
                      className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Date (optional)">
                      <input
                        type="text"
                        value={review.date || ''}
                        onChange={(e) =>
                          updateReview(index, { date: e.target.value })
                        }
                        placeholder="2 weeks ago"
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>

                    <FormField label="Source">
                      <select
                        value={review.source || 'Google'}
                        onChange={(e) =>
                          updateReview(index, { source: e.target.value })
                        }
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Google">Google</option>
                        <option value="Yelp">Yelp</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormField>
                  </div>
                </div>
              )}
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-6 text-zinc-500 text-sm">
              No reviews yet. Click "Add Review" to add one.
            </div>
          )}
        </div>
      </div>

      {/* Google Link */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Google Reviews Link</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.showGoogleLink !== false}
              onChange={(e) => updateContent('showGoogleLink', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-white text-sm">Show "View all reviews" link</span>
          </label>
          {content.showGoogleLink !== false && (
            <FormField label="Link Text">
              <input
                type="text"
                value={content.googleLinkText || ''}
                onChange={(e) => updateContent('googleLinkText', e.target.value)}
                placeholder="View all reviews on Google"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          )}
        </div>
      </div>

      {/* Styles */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">Styles</h4>
        <div className="space-y-4">
          <FormField label="Layout">
            <select
              value={styles.layout || 'grid'}
              onChange={(e) => updateStyles('layout', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
              <option value="list">List</option>
            </select>
          </FormField>

          {styles.layout !== 'list' && (
            <FormField label="Columns">
              <select
                value={styles.columns || 3}
                onChange={(e) =>
                  updateStyles('columns', parseInt(e.target.value))
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
              </select>
            </FormField>
          )}

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={styles.showRating !== false}
              onChange={(e) => updateStyles('showRating', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-white text-sm">Show star ratings</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={styles.showDate || false}
              onChange={(e) => updateStyles('showDate', e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-white text-sm">Show review dates</span>
          </label>
        </div>
      </div>
    </div>
  );
}
