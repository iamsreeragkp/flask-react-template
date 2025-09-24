from bson.objectid import ObjectId
from pymongo import DESCENDING

from modules.application.common.types import PaginationResult
from modules.comment.errors import CommentNotFoundError
from modules.comment.internal.comment_util import CommentUtil
from modules.comment.internal.store.comment_repository import CommentRepository
from modules.comment.types import Comment, GetCommentParams, GetPaginatedCommentsParams


class CommentReader:
    @staticmethod
    def get_comment(*, params: GetCommentParams) -> Comment:
        comment_bson = CommentRepository.collection().find_one(
            {
                "_id": ObjectId(params.comment_id),
                "task_id": params.task_id,
                "account_id": params.account_id,
                "active": True,
            }
        )

        if not comment_bson:
            raise CommentNotFoundError(comment_id=params.comment_id)

        return CommentUtil.convert_comment_bson_to_comment(comment_bson)

    @staticmethod
    def get_paginated_comments(*, params: GetPaginatedCommentsParams) -> PaginationResult[Comment]:
        query = {"task_id": params.task_id, "account_id": params.account_id, "active": True}

        # Gets the total count of comments
        total_count = CommentRepository.collection().count_documents(query)

        skip = (params.pagination_params.page - 1) * params.pagination_params.size

        # newest first order
        comment = (
            CommentRepository.collection()
            .find(query)
            .sort("created_at", DESCENDING)
            .skip(skip)
            .limit(params.pagination_params.size)
        )

        comments = [CommentUtil.convert_comment_bson_to_comment(comment_bson) for comment_bson in comment]

        return PaginationResult(items=comments, total_count=total_count, pagination_params=params.pagination_params)
