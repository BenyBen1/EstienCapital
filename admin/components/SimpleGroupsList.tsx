import React, { useState, useEffect } from 'react';
import { SimpleGroupsAPI, SimpleGroup } from '../../services/simpleGroupsAPI';
import { Text } from './ui/Text';

interface SimpleGroupsListProps {
  onGroupSelect?: (group: SimpleGroup) => void;
}

const SimpleGroupsList: React.FC<SimpleGroupsListProps> = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState<SimpleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'sacco' | 'investment_club' | 'family_account' | 'joint_account' | 'corporate'>('all');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SimpleGroupsAPI.getAllGroups();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadGroups();
  };

  const handleAddGroup = () => {
    alert('Add Group feature coming soon!');
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || group.type === filter;
    return matchesSearch && matchesFilter;
  });

  const totalMembers = groups.reduce((sum, group) => sum + (group.member_count || 0), 0);
  const totalBalance = groups.reduce((sum, group) => sum + (group.simple_balance || 0), 0);
  const activeGroups = groups.filter(g => g.status === 'active').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const getGroupTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      sacco: 'SACCO',
      investment_club: 'Investment Club',
      family_account: 'Family Account',
      joint_account: 'Joint Account',
      corporate: 'Corporate',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-gray-600">Loading groups...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-8">
        <div className="text-lg text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Groups Management</h1>
        <p className="text-gray-600">Manage all group accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Groups</div>
          <div className="text-2xl font-bold text-gray-900">{groups.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Active</div>
          <div className="text-2xl font-bold text-green-600">{activeGroups}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Members</div>
          <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Balance</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalBalance)}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="sacco">SACCO</option>
              <option value="investment_club">Investment Club</option>
              <option value="family_account">Family Account</option>
              <option value="joint_account">Joint Account</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>
          <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            + Add Group
          </button>
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {group.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                        <div className="text-sm text-gray-500">
                          Created {new Date(group.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getGroupTypeDisplay(group.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {group.member_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(group.simple_balance || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      group.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {group.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onGroupSelect?.(group)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => alert(`Edit ${group.name} - Feature coming soon!`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => alert(`Manage members for ${group.name} - Feature coming soon!`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Members
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-sm text-gray-500">
              {searchTerm || filter !== 'all'
                ? 'No groups match your search criteria.'
                : 'No groups found. Create your first group to get started.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleGroupsList;
