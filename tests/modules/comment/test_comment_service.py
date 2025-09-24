from modules.comment.comment_service import CommentService
from modules.comment.errors import CommentNotFoundError, CommentTaskNotFoundError
from modules.comment.types import CreateCommentParams, GetCommentParams, UpdateCommentParams
from tests.modules.comment.base_test_comment import BaseTestComment


class TestCommentService(BaseTestComment):

    def test_create_comment_success(self) -> None:
        account = self.create_test_account()
        task = self.create_test_task(account_id=account.id)

        params = CreateCommentParams(task_id=task.id, account_id=account.id, content="Test comment")

        comment = CommentService.create_comment(params=params)

        assert comment.id is not None
        assert comment.task_id == task.id
        assert comment.account_id == account.id
        assert comment.content == "Test comment"

    def test_create_comment_invalid_task(self) -> None:
        account = self.create_test_account()
        fake_task_id = "507f1f77bcf86cd799439011"

        params = CreateCommentParams(task_id=fake_task_id, account_id=account.id, content="Test comment")

        try:
            CommentService.create_comment(params=params)
            assert False, "Should have raised CommentTaskNotFoundError"
        except CommentTaskNotFoundError:
            pass

    def test_get_comment_success(self) -> None:
        account = self.create_test_account()
        task = self.create_test_task(account_id=account.id)
        created_comment = self.create_test_comment(account_id=account.id, task_id=task.id)

        params = GetCommentParams(account_id=account.id, task_id=task.id, comment_id=created_comment.id)

        comment = CommentService.get_comment(params=params)
        assert comment.id == created_comment.id
        assert comment.content == created_comment.content

    def test_get_comment_not_found(self) -> None:
        account = self.create_test_account()
        task = self.create_test_task(account_id=account.id)
        fake_comment_id = "507f1f77bcf86cd799439011"

        params = GetCommentParams(account_id=account.id, task_id=task.id, comment_id=fake_comment_id)

        try:
            CommentService.get_comment(params=params)
            assert False, "Should have raised CommentNotFoundError"
        except CommentNotFoundError:
            pass

    def test_update_comment_success(self) -> None:
        account = self.create_test_account()
        task = self.create_test_task(account_id=account.id)
        created_comment = self.create_test_comment(account_id=account.id, task_id=task.id, content="Original")

        params = UpdateCommentParams(
            account_id=account.id, task_id=task.id, comment_id=created_comment.id, content="Updated content"
        )

        updated_comment = CommentService.update_comment(params=params)
        assert updated_comment.content == "Updated content"
        assert updated_comment.id == created_comment.id

    # FIXME: Basic sevice tests added , refactor code to add more service tests..
