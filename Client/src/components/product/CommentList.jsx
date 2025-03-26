import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  getProductComments,
  likeComment,
  unlikeComment,
  getUserLikedComments,
} from "../../services/productService";
import { defaultTheme, breakpoints } from "../../styles/themes/default";
import { formatDistanceToNow } from "date-fns";
import CommentForm from "./CommentForm";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const CommentsWrapper = styled.div`
  .comments-heading {
    font-size: 18px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .comments-count {
    font-weight: 600;
    color: ${defaultTheme.color_outerspace};
  }

  .comment-item {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    &:last-child {
      border-bottom: none;
    }
  }

  .comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .comment-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
    background-color: ${defaultTheme.color_platinum};
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .comment-avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${defaultTheme.color_sea_green};
    color: white;
    font-weight: 600;
  }

  .comment-info {
    flex: 1;
  }

  .comment-author {
    font-weight: 600;
    margin-bottom: 2px;
  }

  .comment-date {
    font-size: 12px;
    color: ${defaultTheme.color_gray};
  }

  .comment-rating {
    display: flex;
    margin-top: 4px;
  }

  .star {
    margin-right: 2px;
  }

  .comment-content {
    margin-bottom: 12px;
    line-height: 1.6;
  }

  .comment-actions {
    display: flex;
    font-size: 14px;
    color: ${defaultTheme.color_gray};
  }

  .comment-like,
  .comment-reply {
    display: flex;
    align-items: center;
    margin-right: 16px;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: ${defaultTheme.color_sea_green};
    }

    &.liked {
      color: ${defaultTheme.color_sea_green};
      font-weight: 500;

      i {
        transform: scale(1.2);
      }
    }

    i {
      margin-right: 4px;
      transition: transform 0.2s ease;
    }
  }

  .comment-replies {
    margin-top: 16px;
    margin-left: 52px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .reply-item {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }

  .page-item {
    margin: 0 4px;
  }

  .page-link {
    padding: 6px 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &.active {
      background-color: ${defaultTheme.color_sea_green};
      color: white;
      border-color: ${defaultTheme.color_sea_green};
    }
  }

  .load-more {
    display: block;
    margin: 20px auto 0;
    padding: 8px 24px;
    background-color: transparent;
    border: 1px solid ${defaultTheme.color_sea_green};
    color: ${defaultTheme.color_sea_green};
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: ${defaultTheme.color_sea_green};
      color: white;
    }
  }

  .reply-form {
    margin-left: 52px;
    margin-top: 16px;
  }

  .no-comments {
    text-align: center;
    padding: 40px 0;
    color: ${defaultTheme.color_gray};
  }

  @media (max-width: ${breakpoints.sm}) {
    .comment-replies {
      margin-left: 20px;
    }

    .reply-form {
      margin-left: 20px;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid ${defaultTheme.color_sea_green};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const CommentList = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [refreshComments, setRefreshComments] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());
  const user = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchComments = async () => {
      if (!productId) {
        console.error("No product ID provided for comments");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching comments for product ID: ${productId}`);
        const response = await getProductComments(productId, page);

        if (response && response.success) {
          setComments(response.data.comments || []);
          setTotalPages(response.data.totalPages || 1);
        } else {
          setError(
            "Failed to fetch comments: " +
              (response?.message || "Unknown error")
          );
        }
      } catch (error) {
        console.error("Error in fetchComments:", error);
        setError(error.message || "An error occurred while fetching comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [productId, page, refreshComments]);

  useEffect(() => {
    const fetchLikedComments = async () => {
      if (!productId || !user) {
        return;
      }

      try {
        console.log(
          `Fetching liked comments for user ${user._id} on product ${productId}`
        );
        const response = await getUserLikedComments(productId, user._id);

        if (response && response.success && response.data.likedCommentIds) {
          const likedIds = new Set(response.data.likedCommentIds);
          setLikedComments(likedIds);
          console.log(`User has liked ${likedIds.size} comments`);
        }
      } catch (error) {
        console.error("Error fetching liked comments:", error);
      }
    };

    fetchLikedComments();
  }, [productId, user]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const toggleReplyForm = (commentId) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error("Please sign in to like comments");
      return;
    }

    const isLiked = likedComments.has(commentId);

    try {
      // Optimistic update
      const updatedComments = comments.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            likes: isLiked
              ? Math.max(0, (comment.likes || 0) - 1) // Decrement if unliking
              : (comment.likes || 0) + 1, // Increment if liking
          };
        }
        return comment;
      });

      setComments(updatedComments);

      // Update liked status locally
      if (isLiked) {
        setLikedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      } else {
        setLikedComments((prev) => new Set([...prev, commentId]));
      }

      console.log(
        `${
          isLiked ? "Unliking" : "Liking"
        } comment ${commentId} for product ${productId}`
      );

      // Call API based on action with user_id
      const response = isLiked
        ? await unlikeComment(productId, commentId, { user_id: user._id })
        : await likeComment(productId, commentId, { user_id: user._id });

      if (!response.success) {
        throw new Error(
          response.message || `Failed to ${isLiked ? "unlike" : "like"} comment`
        );
      }

      toast.success(isLiked ? "Comment unliked!" : "Comment liked!");

      // Update comment with actual likes count from server
      if (response.data && response.data.likes !== undefined) {
        const finalUpdatedComments = comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likes: response.data.likes,
            };
          }
          return comment;
        });

        setComments(finalUpdatedComments);
      }
    } catch (error) {
      console.error(`Error ${isLiked ? "unliking" : "liking"} comment:`, error);

      // Revert optimistic update on error
      setRefreshComments(!refreshComments);
      toast.error(
        error.message || `Failed to ${isLiked ? "unlike" : "like"} comment`
      );
    }
  };

  const handleRefreshComments = () => {
    setRefreshComments(!refreshComments);
    toast.success("Comments refreshed");
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index} className="star">
        {index < rating ? (
          <i className="bi bi-star-fill" style={{ color: "#ffc107" }}></i>
        ) : (
          <i className="bi bi-star" style={{ color: "#aaa" }}></i>
        )}
      </span>
    ));
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && page === 1) {
    return (
      <LoadingSpinner>
        <div className="spinner"></div>
      </LoadingSpinner>
    );
  }

  if (error && page === 1) {
    return (
      <CommentsWrapper>
        <div className="comments-heading">
          <h3 className="comments-count">Comments</h3>
        </div>
        <div style={{ color: "red", marginBottom: "20px" }}>
          Error loading comments. Please try again later.
        </div>
        {user && (
          <CommentForm
            productId={productId}
            onCommentAdded={handleRefreshComments}
          />
        )}
      </CommentsWrapper>
    );
  }

  const commentCount = Array.isArray(comments) ? comments.length : 0;

  if (commentCount === 0 && page === 1) {
    return (
      <CommentsWrapper>
        <div className="comments-heading">
          <h3 className="comments-count">No Comments Yet</h3>
        </div>
        <div className="no-comments">
          <p>Be the first to comment on this product!</p>
          {user ? (
            <CommentForm
              productId={productId}
              onCommentAdded={handleRefreshComments}
            />
          ) : (
            <p style={{ marginTop: "20px" }}>
              <a
                href="/sign_in"
                style={{ color: defaultTheme.color_sea_green }}
              >
                Sign in
              </a>{" "}
              to leave a comment
            </p>
          )}
        </div>
      </CommentsWrapper>
    );
  }

  return (
    <CommentsWrapper>
      <div className="comments-heading">
        <h3 className="comments-count">Comments ({commentCount})</h3>
      </div>

      {user ? (
        <CommentForm
          productId={productId}
          onCommentAdded={handleRefreshComments}
        />
      ) : (
        <p style={{ marginBottom: "20px" }}>
          <a href="/sign_in" style={{ color: defaultTheme.color_sea_green }}>
            Sign in
          </a>{" "}
          to leave a comment
        </p>
      )}

      {Array.isArray(comments) &&
        comments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <div className="comment-header">
              <div className="comment-avatar">
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.user_name} />
                ) : (
                  <div className="comment-avatar-placeholder">
                    {getInitials(comment.user_name)}
                  </div>
                )}
              </div>
              <div className="comment-info">
                <div className="comment-author">
                  {comment.user_name || "Anonymous"}
                </div>
                <div className="comment-date">
                  {formatDate(comment.created_at)}
                </div>
                <div className="comment-rating">
                  {renderStars(comment.rating)}
                </div>
              </div>
            </div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-actions">
              <div
                className={`comment-like ${
                  likedComments.has(comment._id) ? "liked" : ""
                }`}
                onClick={() => handleLikeComment(comment._id)}
                title={
                  likedComments.has(comment._id)
                    ? "Click to unlike this comment"
                    : "Like this comment"
                }
              >
                <i
                  className={`bi ${
                    likedComments.has(comment._id)
                      ? "bi-hand-thumbs-up-fill"
                      : "bi-hand-thumbs-up"
                  }`}
                ></i>
                <span>
                  {likedComments.has(comment._id) ? "Unlike" : "Like"} (
                  {comment.likes || 0})
                </span>
              </div>
              <div
                className="comment-reply"
                onClick={() => toggleReplyForm(comment._id)}
              >
                <i className="bi bi-reply"></i>
                <span>
                  Reply ({(comment.replies && comment.replies.length) || 0})
                </span>
              </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
              <div className="comment-replies">
                {comment.replies.map((reply, index) => (
                  <div key={index} className="reply-item">
                    <div className="comment-header">
                      <div className="comment-avatar">
                        {reply.avatar ? (
                          <img src={reply.avatar} alt={reply.user_name} />
                        ) : (
                          <div className="comment-avatar-placeholder">
                            {getInitials(reply.user_name)}
                          </div>
                        )}
                      </div>
                      <div className="comment-info">
                        <div className="comment-author">
                          {reply.user_name || "Anonymous"}
                        </div>
                        <div className="comment-date">
                          {formatDate(reply.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="comment-content">{reply.content}</div>
                  </div>
                ))}
              </div>
            )}

            {activeReplyId === comment._id && user && (
              <div className="reply-form">
                <CommentForm
                  productId={productId}
                  commentId={comment._id}
                  isReply={true}
                  onCommentAdded={handleRefreshComments}
                  onCancel={() => setActiveReplyId(null)}
                />
              </div>
            )}
          </div>
        ))}

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div key={index} className="page-item">
              <button
                className={`page-link ${page === index + 1 ? "active" : ""}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            </div>
          ))}
        </div>
      )}
    </CommentsWrapper>
  );
};

export default CommentList;
