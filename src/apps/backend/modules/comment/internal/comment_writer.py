from datetime import datetime

from bson.objectid import ObjectId
from pymongo import ReturnDocument

from modules.comment.errors import CommentNotFoundError, CommentTaskNotFoundError
from modules.comment.internal.comment_util import CommentUtil
from modules.comment.internal.store.comment_model import CommentModel
from modules.comment.internal.store.comment_repository import CommentRepository
from modules.comment.types import (
    Comment,
    CommentDeletionResult,
    CreateCommentParams,
    DeleteCommentParams,
    UpdateCommentParams,
)
from modules.task.internal.store.task_repository import TaskRepository


class CommentWriter:
    @staticmethod
    def create_comment(*, params: CreateCommentParams) -> Comment:
        # Check if task already exists
        task_bson = TaskRepository.collection().find_one(
            {"_id": ObjectId(params.task_id), "account_id": params.account_id, "active": True}
        )

        if task_bson == None:
            raise CommentTaskNotFoundError(task_id=params.task_id)

        comment_bson = CommentModel(
            task_id=params.task_id, account_id=params.account_id, content=params.content
        ).to_bson()

        query = CommentRepository.collection().insert_one(comment_bson)
        created_comment_bson = CommentRepository.collection().find_one({"_id": query.inserted_id})

        return CommentUtil.convert_comment_bson_to_comment(created_comment_bson)

    @staticmethod
    def update_comment(*, params: UpdateCommentParams) -> Comment:
        # First verify that the task is already there and belongs to the given account.
        task_bson = TaskRepository.collection().find_one(
            {"_id": ObjectId(params.task_id), "account_id": params.account_id, "active": True}
        )

        if not task_bson:
            raise CommentTaskNotFoundError(task_id=params.task_id)

        updated_comment = CommentRepository.collection().find_one_and_update(
            {
                "_id": ObjectId(params.comment_id),
                "task_id": params.task_id,
                "account_id": params.account_id,
                "active": True,
            },
            {"$set": {"content": params.content, "updated_at": datetime.now()}},
            return_document=ReturnDocument.AFTER,
        )

        if updated_comment == None:
            raise CommentNotFoundError(comment_id=params.comment_id)

        return CommentUtil.convert_comment_bson_to_comment(updated_comment)

    @staticmethod
    def delete_comment(*, params: DeleteCommentParams) -> CommentDeletionResult:
        # First verify that the task is already there and belongs to the given account.
        task_bson = TaskRepository.collection().find_one(
            {"_id": ObjectId(params.task_id), "account_id": params.account_id, "active": True}
        )

        if task_bson is None:
            raise CommentTaskNotFoundError(task_id=params.task_id)

        deleted_time = datetime.now()
        result = CommentRepository.collection().find_one_and_update(
            {
                "_id": ObjectId(params.comment_id),
                "task_id": params.task_id,
                "account_id": params.account_id,
                "active": True,
            },
            {"$set": {"active": False, "updated_at": deleted_time}},
            return_document=ReturnDocument.AFTER,
        )

        if result is None:
            raise CommentNotFoundError(comment_id=params.comment_id)

        return CommentDeletionResult(comment_id=params.comment_id, deleted_at=deleted_time, success=True)
