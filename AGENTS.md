# Agent 工作约定

## PR 修改流程

当用户要求修改某个 PR（尤其是提供了 GitHub PR 链接或 PR 编号）时，按以下流程操作：

1. **定位 PR 源分支**
   - 优先确认 PR 属于当前仓库的 `origin` 还是 `upstream`。
   - 通过 GitHub API 获取源分支名：
     ```bash
     curl -s https://api.github.com/repos/<owner>/<repo>/pulls/<number> | \
       python -c "import sys,json;d=json.load(sys.stdin);print(d['head']['ref'])"
     ```
   - 同时 fetch PR head ref 以便本地操作：
     ```bash
     git fetch origin refs/pull/<number>/head:refs/remotes/origin/pr/<number>-head
     ```

2. **直接基于 PR 源分支修改**
   - 切出本地临时工作分支，基于 `origin/<源分支名>`（或 PR head ref）。
   - 在该分支上进行代码修改并提交。
   - 直接 push 到 `origin/<源分支名>`，从而更新原 PR。
   - **不要**为 PR 修复创建额外的长期分支（如 `fix-xxx`）再让用户去开新 PR。

3. **清理**
   - push 完成后删除本地临时工作分支。
   - 如果中间误建了其他分支，一并删除。

## 禁忌

- 不要直接在 `main` 上修改 PR 相关代码。
- 不要创建新的分支来替代原 PR 分支，除非用户明确要求。
- 推送前确认 remote 和分支名，避免误推到 `upstream` 或其他 fork。

## 经验教训

- 用户通常希望直接迭代现有 PR，而不是拿到一个新的分支再去开 PR。
- 通过 GitHub API 获取 `head.ref` 是最可靠的分支定位方式。
- 在 push 到 PR 源分支前，先 `git fetch origin <branch>` 确保基于最新提交。
