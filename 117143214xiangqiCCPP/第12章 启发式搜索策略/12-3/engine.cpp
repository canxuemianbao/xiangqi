#include <windows.h>
#include <stdio.h>
#include "Board.h"
#include "ucci.h"
#include "pipe.h"
#include "def.h"

extern "C" WINBASEAPI HWND WINAPI GetConsoleWindow ();
void main(int argc, char *argv[])
{
	int i;
	move mv;
	UcciCommEnum uce;
	UcciCommStruct ucs;

	if(GetConsoleWindow())
	{
		g_ShowWindow = 1;
		printf("Yes window!\n");
		fflush(stdout);
	}
	else
	{
		g_ShowWindow = 0;
		printf("No window!\n");
		fflush(stdout);
	}

	if (BootLine() == UCCI_COMM_UCCI) 
	{
		g_Board.TotalMoveNum = 0;

		g_Board.IniZobrist();
		g_Board.NewHashTable();
		
		printf("id name engine12-3\n");
		fflush(stdout);
		printf("id copyright 2007-2008\n");
		fflush(stdout);
		printf("id author WestWind\n");
		fflush(stdout);
		printf("option batch type check default false\n");
		fflush(stdout);
		printf("option debug type check default false\n");
		fflush(stdout);
		printf("option usemillisec type check default false\n");
		fflush(stdout);
		printf("option loadbook type button\n");
		fflush(stdout);
		printf("ucciok\n");
		fflush(stdout);

		// 以下是接收指令和提供对策的循环体
		uce = UCCI_COMM_NONE;
		while (uce != UCCI_COMM_QUIT) 
		{
			uce = IdleLine(ucs,FALSE);
			switch (uce) 
			{
			case UCCI_COMM_ISREADY:
				printf("readyok\n");
				fflush(stdout);
				break;
			case UCCI_COMM_STOP:
				printf("nobestmove\n");
				fflush(stdout);
				break;
			case UCCI_COMM_POSITION:
				g_Board.StringToArray(ucs.Position.szFenStr);
				for (i = 0; i < ucs.Position.nMoveNum; i ++) 
				{
					mv.Move(ucs.Position.lpdwCoordList[i]);
					if (mv.from==0 && mv.to ==0) {
						break;
					}
					if (g_Board.board[mv.from] == 0) {
						break;
					}
					g_Board.MakeMove(mv);
				}
				break;
			case UCCI_COMM_BANMOVES:
				break;
			case UCCI_COMM_SETOPTION:
				switch (ucs.Option.uoType) 
				{
				case UCCI_OPTION_BATCH:
					break;
				case UCCI_OPTION_DEBUG:
					break;
				case UCCI_OPTION_NEWGAME:
					g_Board.NewGame();
					//暂不考虑开局库
					break;
				default:
					break;
				}
				break;//UCCI_COMM_SETOPTION:
			case UCCI_COMM_GO:
			case UCCI_COMM_GOPONDER:
				//暂不考虑后台思考
				if(ucs.Search.utMode == UCCI_TIME_DEPTH)
					g_Board.ComputerThinkDepth(ucs.Search.DepthTime.nDepth);
				else
					g_Board.ComputerThinkTimer(ucs.Search.DepthTime.nTime);
				break;
			}//switch (uce) 

		}
		g_Board.DelHashTable();
	}

	printf("bye\n");
	fflush(stdout);
}
