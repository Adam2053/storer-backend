// utils/buildDriveTree.js
export function buildDriveTree(files) {
  const map = {}; // id → node
  const roots = [];

  // Step 1: Create nodes
  files.forEach(file => {
    map[file.id] = { ...file, children: [] };
  });

  // Step 2: Attach children to parents
  files.forEach(file => {
    if (file.parents && file.parents.length > 0) {
      const parentId = file.parents[0];
      if (map[parentId]) {
        map[parentId].children.push(map[file.id]);
      } else {
        roots.push(map[file.id]); // Orphan → treat as root
      }
    } else {
      roots.push(map[file.id]); // No parent → root
    }
  });

  return roots;
}
