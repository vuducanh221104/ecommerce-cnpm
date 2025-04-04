import { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import {
  addProductComment,
  replyToComment,
} from "../../services/productService";
import { defaultTheme, breakpoints } from "../../styles/themes/default";
import toast from "react-hot-toast";

const FormWrapper = styled.div`
  margin-bottom: 30px;

  .form-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: ${defaultTheme.color_sea_green};
    }
  }

  .rating-select {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  .rating-label {
    margin-right: 12px;
    font-size: 14px;
  }

  .stars {
    display: flex;
  }

  .star {
    cursor: pointer;
    font-size: 24px;
    margin-right: 8px;
    transition: color 0.2s ease;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .cancel-btn {
    padding: 8px 16px;
    background-color: transparent;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  .submit-btn {
    padding: 8px 16px;
    background-color: ${defaultTheme.color_sea_green};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0e8774;
    }

    &:disabled {
      background-color: #a0a0a0;
      cursor: not-allowed;
    }
  }

  @media (max-width: ${breakpoints.sm}) {
    .form-actions {
      flex-direction: column;
    }

    .submit-btn,
    .cancel-btn {
      width: 100%;
    }
  }
`;

const CommentForm = ({
  productId,
  commentId,
  isReply = false,
  onCommentAdded,
  onCancel,
}) => {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector((state) => state.user.currentUser);

  if (!user) {
    return null;
  }

  if (!productId) {
    console.error("No product ID provided to CommentForm");
    return (
      <div style={{ color: "red" }}>
        Error: Cannot add comments at this time
      </div>
    );
  }

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const handleStarHover = (value) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log(
        `Submitting ${
          isReply ? "reply" : "comment"
        } for product ID: ${productId}`
      );

      if (isReply) {
        if (!commentId) {
          toast.error("Missing comment ID for reply");
          return;
        }

        const result = await replyToComment(productId, commentId, {
          user_id: user._id,
          user_name: user.user_name || user.full_name || "Anonymous",
          avatar: user.avatar || "",
          content: content.trim(),
        });

        if (result.success) {
          toast.success("Reply added successfully");
        } else {
          throw new Error(result.message || "Failed to add reply");
        }
      } else {
        const commentData = {
          user_id: user._id,
          user_name: user.user_name || user.full_name || "Anonymous",
          avatar: user.avatar || "",
          content: content.trim(),
          rating,
        };

        const result = await addProductComment(productId, commentData);

        if (result.success) {
          toast.success("Comment added successfully");
        } else {
          throw new Error(result.message || "Failed to add comment");
        }
      }

      setContent("");
      if (!isReply) setRating(5);

      if (onCommentAdded) {
        onCommentAdded();
      }

      if (onCancel && isReply) {
        onCancel();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error(error.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStarColor = (index) => {
    const activeRating = hoveredRating || rating;
    return index < activeRating ? "#ffc107" : "#d1d1d1";
  };

  return (
    <FormWrapper>
      <h4 className="form-title">
        {isReply ? "Add a reply" : "Write a comment"}
      </h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder={
              isReply
                ? "Write your reply here..."
                : "Write your comment here..."
            }
            rows={isReply ? 3 : 4}
          />
        </div>

        {!isReply && (
          <div className="rating-select">
            <span className="rating-label">Rating:</span>
            <div className="stars" onMouseLeave={handleStarLeave}>
              {[1, 2, 3, 4, 5].map((value) => (
                <span
                  key={value}
                  className="star"
                  onClick={() => handleRatingChange(value)}
                  onMouseEnter={() => handleStarHover(value)}
                >
                  <i
                    className="bi bi-star-fill"
                    style={{ color: getStarColor(value - 1) }}
                  ></i>
                </span>
              ))}
            </div>
            <span
              className="rating-value"
              style={{ marginLeft: "10px", fontSize: "14px", color: "#666" }}
            >
              ({rating} star{rating !== 1 ? "s" : ""})
            </span>
          </div>
        )}

        <div className="form-actions">
          {isReply && onCancel && (
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting
              ? "Submitting..."
              : isReply
              ? "Reply"
              : "Submit Comment"}
          </button>
        </div>
      </form>
    </FormWrapper>
  );
};

export default CommentForm;
