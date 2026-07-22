import React from 'react';

export default function UserTable({
  users,
  currentPage,
  loading,
  isReadOnly,
  handleEdit,
  handleDelete
}) {
  return (
    <>
      {/* ── Desktop table (hidden on mobile via CSS) ── */}
      <div className="audit-table-wrapper user-table-desktop">
        <table className="audit-table">
          <thead>
            <tr>
              <th style={{ width: '40px', paddingLeft: '16px' }}>#</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Password</th>
              {!isReadOnly && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8">Loading...</td></tr>
            ) : (
              users.map((u, index) => (
                <tr key={u.username}>
                  <td style={{ color: '#64748b', fontWeight: 600, fontSize: '0.8rem', paddingLeft: '16px' }}>{(currentPage - 1) * 15 + index + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.role?.replace('_', ' ')}</td>
                  <td>{u.branch}</td>
                  <td>{u.password ? '******' : ''}</td>
                  {!isReadOnly && (
                    <td className="user-admin-actions">
                      <button className="btn-edit-mini" onClick={() => handleEdit(u)}>Edit</button>
                      {u.username !== 'admin' && <button className="btn-danger-mini" onClick={() => handleDelete(u.username)}>Delete</button>}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list (hidden on desktop via CSS) ── */}
      <div className="user-cards-mobile">
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : (
          users.map((u, index) => (
            <div key={u.username} className="user-card">
              <div className="user-card-avatar">
                {u.name ? u.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="user-card-body">
                <div className="user-card-top">
                  <div>
                    <div className="user-card-name">{u.name}</div>
                    <div className="user-card-sub">@{u.username}{u.email ? ` · ${u.email}` : ''}</div>
                  </div>
                  <span className="user-card-number">#{(currentPage - 1) * 15 + index + 1}</span>
                </div>
                <div className="user-card-badges">
                  <span className="user-badge role">{u.role?.replace('_', ' ')}</span>
                  <span className="user-badge branch">{u.branch}</span>
                </div>
                {!isReadOnly && (
                  <div className="user-card-actions">
                    <button className="btn-edit-mini" onClick={() => handleEdit(u)}>Edit</button>
                    {u.username !== 'admin' && (
                      <button className="btn-danger-mini" onClick={() => handleDelete(u.username)}>Delete</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
