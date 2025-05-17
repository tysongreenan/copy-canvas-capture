
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useNavigate } from 'react-router-dom';

const SitemapNodeComponent = ({ data, isConnectable }) => {
  const navigate = useNavigate();
  
  const handleNodeClick = () => {
    if (data.path) {
      navigate(data.path);
    }
  };

  return (
    <div 
      className="px-4 py-2 shadow-md rounded-md border border-gray-300 bg-white dark:bg-card dark:border-gray-700 w-40"
      onClick={handleNodeClick}
    >
      <div className="flex items-center">
        {data.icon && (
          <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            {data.icon}
          </div>
        )}
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
          {data.description && <div className="text-xs text-gray-500">{data.description}</div>}
        </div>
      </div>

      {data.handles?.includes('top') && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          className="w-2 h-2"
        />
      )}
      {data.handles?.includes('right') && (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="w-2 h-2"
        />
      )}
      {data.handles?.includes('bottom') && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-2 h-2"
        />
      )}
      {data.handles?.includes('left') && (
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="w-2 h-2"
        />
      )}
    </div>
  );
};

export const SitemapNode = memo(SitemapNodeComponent);
