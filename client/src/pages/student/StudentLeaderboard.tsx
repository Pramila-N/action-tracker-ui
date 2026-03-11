import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentRank {
  id: string;
  name: string;
  email: string;
  productivityScore: number;
  completedTasks: number;
  rank: number;
}

export function StudentLeaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<StudentRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStudentRank, setCurrentStudentRank] = useState<StudentRank | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://action-tracker-backend.onrender.com';

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get all students leaderboard
        const response = await fetch(`${API_BASE_URL}/api/tasks/productivity/leaderboard/all`);

        if (!response.ok) {
          throw new Error(`Failed to load leaderboard: ${response.status}`);
        }

        const data = await response.json();
        const allStudents = data.leaderboard || [];

        if (isMounted) {
          // Add rank to each student
          const rankedStudents = allStudents.map((student: StudentRank, index: number) => ({
            ...student,
            rank: index + 1,
          }));

          setLeaderboard(rankedStudents);

          // Find current student's rank
          const currentRank = rankedStudents.find((s: StudentRank) => s.id === user.id);
          setCurrentStudentRank(currentRank || null);
        }
      } catch (error) {
        console.error('Load leaderboard error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLeaderboard();

    // Poll every 30 seconds for updates
    const interval = setInterval(loadLeaderboard, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [API_BASE_URL, user]);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <Star className="w-5 h-5 text-blue-400" />;
    }
  };

  const getRankColor = (_rank: number, isCurrent: boolean) => {
    if (isCurrent) {
      return 'from-blue-50 to-blue-100 border-blue-500 shadow-lg';
    }
    return 'from-slate-50 to-white border-slate-200';
  };

  const isCurrentStudent = (studentId: string) => studentId === user?.id;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🏆 Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank among your peers
          </p>
        </div>

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>All Students Rankings</CardTitle>
            <CardDescription>
              Total students: {leaderboard.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No students found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {leaderboard.map((student) => {
                  const isCurrent = isCurrentStudent(student.id);
                  return (
                    <div
                      key={student.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                        `bg-gradient-to-r ${getRankColor(student.rank, isCurrent)}`,
                        isCurrent && 'ring-2 ring-blue-400 ring-offset-2'
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Rank Display */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm flex-shrink-0">
                          {getMedalIcon(student.rank)}
                        </div>

                        {/* Student Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={cn(
                              "font-semibold truncate",
                              "text-sm"
                            )}>
                              {student.name}
                            </h3>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full flex-shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className={cn(
                              "font-bold",
                              "text-lg"
                            )}>
                              {student.productivityScore}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Rank</p>
                            <p className={cn(
                              "font-bold text-blue-600",
                              "text-xl"
                            )}>
                              #{student.rank}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-900 text-base">How Scores are Calculated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <p>
              <strong>+7 points:</strong> Early task completion (before deadline)
            </p>
            <p>
              <strong>+5 points:</strong> On-time task completion (by deadline)
            </p>
            <p>
              <strong>+0 points:</strong> Pending task (not completed yet)
            </p>
            <p>
              <strong>-2 points:</strong> Late submission (first time)
            </p>
            <p>
              <strong>-1 point:</strong> Task rejected by faculty (each rejection)
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
