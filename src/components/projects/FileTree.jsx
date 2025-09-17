import { ChevronDownIcon, ChevronRightIcon, DocumentIcon, FolderIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const FileTree = ({ nodes, expanded, onToggle, onSelect, activeId }) => {
  if (!nodes || nodes.length === 0) {
    return <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Henüz dosya bulunmuyor.</p>;
  }

  return (
    <ul>
      {nodes.map((node) => {
        const isFolder = node.type === 'folder';
        const isExpanded = expanded.has(node.id);
        return (
          <li key={node.id}>
            <div
              className={clsx('file-tree-node', { active: node.id === activeId })}
              onClick={() => onSelect(node)}
              role="button"
              tabIndex={0}
            >
              {isFolder ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle(node.id);
                  }}
                  style={{ border: 'none', background: 'transparent', color: '#64748b' }}
                >
                  {isExpanded ? <ChevronDownIcon width={16} height={16} /> : <ChevronRightIcon width={16} height={16} />}
                </button>
              ) : (
                <span style={{ width: 16 }} />
              )}
              {isFolder ? <FolderIcon width={18} height={18} /> : <DocumentIcon width={18} height={18} />}
              <span>{node.name}</span>
            </div>
            {isFolder && node.children && node.children.length > 0 && isExpanded && (
              <FileTree nodes={node.children} expanded={expanded} onToggle={onToggle} onSelect={onSelect} activeId={activeId} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default FileTree;
