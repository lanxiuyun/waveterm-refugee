# Agent 工作约定

## PR 修改流程

当用户要求修改某个 PR（尤其是提供了 GitHub PR 链接或 PR 编号）时，按以下流程操作：

1. **确认 PR 所属仓库**
   - **只修改用户自己 fork 里的 PR**（即当前仓库的 `origin`）。
   - 如果 PR 在 `upstream` 或别人的 fork，且用户没有写权限，**不要**直接更新原 PR；应告知用户并让其选择下一步（如开新 PR、让作者加权限、或只提供 patch）。
   - 通过 GitHub API 确认仓库和源分支：
     ```bash
     curl -s https://api.github.com/repos/<owner>/<repo>/pulls/<number> | \
       python -c "import sys,json;d=json.load(sys.stdin);print(d['head']['ref'])"
     ```
   - **不要**凭直觉默认 upstream。

2. **定位 PR 源分支**
   - 对于自己 fork 的 PR，fetch PR head ref：
     ```bash
     git fetch origin refs/pull/<number>/head:refs/remotes/origin/pr/<number>-head
     ```
   - 切出本地临时工作分支，基于 `origin/<源分支名>`（或 PR head ref）。

3. **直接基于 PR 源分支修改**
   - 在该分支上进行代码修改并提交。
   - 直接 push 到 `origin/<源分支名>`，从而更新原 PR。
   - **不要**为 PR 修复创建额外的长期分支（如 `fix-xxx`）再让用户去开新 PR。
   - **不要**一上来就 force push。如需替换方案，优先在原分支顶端追加 commit（fast-forward）。

4. **清理**
   - push 完成后删除本地临时工作分支。
   - 如果中间误建了其他分支或远程分支，一并删除。

## 禁忌

- 不要直接在 `main` 上修改 PR 相关代码。
- 不要创建新的分支来替代原 PR 分支，除非用户明确要求。
- 推送前确认 remote 和分支名，避免误推到 `upstream` 或其他 fork。
- **不要**在用户没有写权限的 PR 源分支上强行 push。
- **不要**默认用 force push 重写 PR 历史。

## 经验教训

- 用户通常希望直接迭代现有 PR，而不是拿到一个新的分支再去开 PR。
- 通过 GitHub API 获取 `head.ref` 是最可靠的分支定位方式。
- 在 push 到 PR 源分支前，先 `git fetch origin <branch>` 确保基于最新提交。
- 用户说 "pr/xxx" 时，要先确认是哪个仓库的 PR（`origin`、`upstream` 还是其他 fork），避免改错仓库。
- 优先用普通 push / fast-forward 追加 commit，保留原历史；force push 只在用户明确要求或恢复误操作时才用。
- 如果已经误 force push，可以从 reflog 或原始 SHA 恢复：先 force push 回原始 head，再追加新 commit 并普通 push。
- 确保 patch 基于正确的 base，避免混入无关配置变更（如 `tsconfig.json` 的其他差异）。
