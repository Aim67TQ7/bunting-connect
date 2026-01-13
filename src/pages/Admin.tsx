import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Key, 
  UserX, 
  UserCheck,
  Link2,
  ArrowLeft,
  Loader2,
  X
} from 'lucide-react';
import BuntingLogo from '@/components/BuntingLogo';
import DevBanner from '@/components/DevBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { isDevelopment } from '@/lib/auth';
import { toast } from 'sonner';

interface EmployeeBadge {
  badge_number: string;
  first_name: string;
  last_name: string;
  department: string;
  is_active: boolean;
  user_id: string | null;
  linked_email: string | null;
  last_login: string | null;
  created_at: string;
}

// Mock data for demonstration
const mockBadges: EmployeeBadge[] = [
  {
    badge_number: 'B001',
    first_name: 'John',
    last_name: 'Smith',
    department: 'Production',
    is_active: true,
    user_id: '123',
    linked_email: 'john.smith@buntingmagnetics.com',
    last_login: '2024-01-15T10:30:00Z',
    created_at: '2023-06-01T00:00:00Z',
  },
  {
    badge_number: 'B002',
    first_name: 'Jane',
    last_name: 'Doe',
    department: 'Warehouse',
    is_active: true,
    user_id: null,
    linked_email: null,
    last_login: null,
    created_at: '2023-08-15T00:00:00Z',
  },
  {
    badge_number: 'B003',
    first_name: 'Mike',
    last_name: 'Johnson',
    department: 'Shipping',
    is_active: false,
    user_id: '456',
    linked_email: 'mike.j@buntingmagnetics.com',
    last_login: '2023-12-20T14:00:00Z',
    created_at: '2023-03-10T00:00:00Z',
  },
];

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [badges, setBadges] = useState<EmployeeBadge[]>(mockBadges);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetPinDialogOpen, setIsResetPinDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<EmployeeBadge | null>(null);
  const [newPin, setNewPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for new badge
  const [newBadge, setNewBadge] = useState({
    badge_number: '',
    first_name: '',
    last_name: '',
    department: '',
    pin: '',
  });

  const filteredBadges = badges.filter(badge => 
    badge.badge_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    badge.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    badge.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    badge.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBadge = async () => {
    if (!newBadge.badge_number || !newBadge.first_name || !newBadge.last_name || !newBadge.department || !newBadge.pin) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newBadge.pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    setIsLoading(true);
    
    // TODO: Create badge in Supabase with hashed PIN
    // const hashedPin = await bcrypt.hash(newBadge.pin, 10);
    // await supabase.from('employee_badges').insert({...});

    toast.info('Badge creation requires Supabase configuration');
    
    // Mock success
    const mockNewBadge: EmployeeBadge = {
      badge_number: newBadge.badge_number,
      first_name: newBadge.first_name,
      last_name: newBadge.last_name,
      department: newBadge.department,
      is_active: true,
      user_id: null,
      linked_email: null,
      last_login: null,
      created_at: new Date().toISOString(),
    };
    
    setBadges([...badges, mockNewBadge]);
    setNewBadge({ badge_number: '', first_name: '', last_name: '', department: '', pin: '' });
    setIsAddDialogOpen(false);
    setIsLoading(false);
    toast.success('Badge created successfully');
  };

  const handleResetPin = async () => {
    if (!selectedBadge) return;
    
    setIsLoading(true);
    
    // Generate random 4-digit PIN
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // TODO: Hash and update PIN in Supabase
    // const hashedPin = await bcrypt.hash(generatedPin, 10);
    // await supabase.from('employee_badges').update({ pin_hash: hashedPin }).eq('badge_number', selectedBadge.badge_number);

    toast.info('PIN reset requires Supabase configuration');
    
    setNewPin(generatedPin);
    setIsLoading(false);
  };

  const handleToggleStatus = async (badge: EmployeeBadge) => {
    // TODO: Update in Supabase
    // await supabase.from('employee_badges').update({ is_active: !badge.is_active }).eq('badge_number', badge.badge_number);

    setBadges(badges.map(b => 
      b.badge_number === badge.badge_number 
        ? { ...b, is_active: !b.is_active }
        : b
    ));
    
    toast.success(`Badge ${badge.is_active ? 'deactivated' : 'activated'}`);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DevBanner />
      
      {/* Header */}
      <header className={`border-b border-border bg-card ${isDevelopment() ? 'pt-8' : ''}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <BuntingLogo size="sm" />
              <span className="text-lg font-semibold text-foreground">Badge Management</span>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Badge
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Badge Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Linked Email</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBadges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No badges found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBadges.map((badge) => (
                  <TableRow key={badge.badge_number}>
                    <TableCell className="font-mono font-medium">
                      {badge.badge_number}
                    </TableCell>
                    <TableCell>
                      {badge.first_name} {badge.last_name}
                    </TableCell>
                    <TableCell>{badge.department}</TableCell>
                    <TableCell>
                      <Badge variant={badge.is_active ? 'default' : 'secondary'}>
                        {badge.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {badge.linked_email || (
                        <span className="text-muted-foreground">Not linked</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(badge.last_login)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedBadge(badge);
                            setNewPin(null);
                            setIsResetPinDialogOpen(true);
                          }}
                          title="Reset PIN"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(badge)}
                          title={badge.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {badge.is_active ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </Button>
                        {!badge.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.info('User linking requires Supabase')}
                            title="Link to user"
                          >
                            <Link2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Add Badge Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Badge</DialogTitle>
            <DialogDescription>
              Create a new employee badge with a PIN for authentication.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="badge_number">Badge Number</Label>
                <Input
                  id="badge_number"
                  placeholder="e.g., B004"
                  value={newBadge.badge_number}
                  onChange={(e) => setNewBadge({ ...newBadge, badge_number: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g., Production"
                  value={newBadge.department}
                  onChange={(e) => setNewBadge({ ...newBadge, department: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  placeholder="First name"
                  value={newBadge.first_name}
                  onChange={(e) => setNewBadge({ ...newBadge, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="Last name"
                  value={newBadge.last_name}
                  onChange={(e) => setNewBadge({ ...newBadge, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">Initial PIN (4 digits)</Label>
              <Input
                id="pin"
                type="password"
                placeholder="• • • •"
                value={newBadge.pin}
                onChange={(e) => setNewBadge({ ...newBadge, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                maxLength={4}
                className="tracking-[0.5em] text-center"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBadge} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset PIN Dialog */}
      <Dialog open={isResetPinDialogOpen} onOpenChange={setIsResetPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset PIN</DialogTitle>
            <DialogDescription>
              {selectedBadge && `Reset PIN for badge ${selectedBadge.badge_number} (${selectedBadge.first_name} ${selectedBadge.last_name})`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {newPin ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">New PIN (show once):</p>
                <div className="bg-muted rounded-lg p-4 font-mono text-3xl tracking-[0.5em] font-bold">
                  {newPin}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Please share this PIN securely with the employee. It will not be shown again.
                </p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                This will generate a new random 4-digit PIN for this badge.
              </p>
            )}
          </div>

          <DialogFooter>
            {newPin ? (
              <Button onClick={() => {
                setIsResetPinDialogOpen(false);
                setNewPin(null);
              }}>
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsResetPinDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleResetPin} disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate New PIN
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
