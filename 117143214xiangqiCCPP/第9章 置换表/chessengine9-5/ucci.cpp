// ucci.h/ucci.cpp - Source Code for ElephantEye, Part I

#include <stdio.h>
#include <string.h>
#include "pipe.h"
#include "ucci.h"  
#include <malloc.h>

static int ReadDigit(char *&lpLinePtr, int nMaxValue) 
{
	int nRetValue;
	nRetValue = 0;
	for (; ; ) 
	{
		if (*lpLinePtr >= '0' && *lpLinePtr <= '9') 
		{
			nRetValue *= 10;
			nRetValue += *lpLinePtr - '0';
			lpLinePtr ++;
			if (nRetValue > nMaxValue) 
			{
				nRetValue = nMaxValue;
			}
		} 
		else 
		{
			break;
		}
	}
	return nRetValue;
}

/* UCCI指令分析模块由三各UCCI指令解释器组成。
 *
 * 其中第一个解释器"BootLine()"最简单，只用来接收引擎启动后的第一行指令
 * 输入"ucci"时就返回"UCCI_COMM_UCCI"，否则一律返回"UCCI_COMM_NONE"
 * 前两个解释器都等待是否有输入，如果没有输入则执行待机指令"Idle()"
 * 而第三个解释器("BusyLine()"，只用在引擎思考时)则在没有输入时直接返回"UCCI_COMM_NONE"
 */
static PipeStruct pipeStdHandle;
char szCommandLineStr[LINE_INPUT_MAX_CHAR];

UcciCommEnum BootLine(void) 
{
	char szLineStr[LINE_INPUT_MAX_CHAR];
	pipeStdHandle.Open();
	while (!pipeStdHandle.LineInput(szLineStr)) 
	{
		Sleep(1);
	}
	if (strcmp(szLineStr, "ucci") == 0) 
	{
		return UCCI_COMM_UCCI;
	} 
	else 
	{
		return UCCI_COMM_NONE;
	}
}

static long dwCoordList[256];

//
/*
strncmp(char *s1,char * s2，int n);
  功能：比较字符串s1和s2的前n个字符。
  
  说明：
        当s1<s2时，返回值<0
        当s1=s2时，返回值=0
        当s1>s2时，返回值>0
*/
//
UcciCommEnum IdleLine(UcciCommStruct &ucsCommand,BOOL bDebug) 
{
//	char szLineStr[LINE_INPUT_MAX_CHAR];
	int i;
	char *lpLineChar;
	UcciCommEnum uceReturnValue;

	while (!pipeStdHandle.LineInput(szCommandLineStr)) 
	{
		Sleep(1);
	}
	lpLineChar = szCommandLineStr;

	  // 1. "isready"指令
	if (strcmp(lpLineChar, "isready") == 0) 
	{
		return UCCI_COMM_ISREADY;
	} 
	// 2. "setoption <option> [<arguments>]"指令
	else if (strncmp(lpLineChar, "setoption ", 10) == 0) 
	{
		lpLineChar += 10;
		return UCCI_COMM_SETOPTION;
	}//蒋鹏注:OPTION选项结束
  
	// 3. "position {<special_position> | fen <fen_string>} [moves <move_list>]"指令
	else if (strncmp(lpLineChar, "position ", 9) == 0) 
	{
		lpLineChar += 9;

		if (strncmp(lpLineChar, "fen ", 4) == 0) 
		{
			ucsCommand.Position.szFenStr = lpLineChar + 4;
			// 如果两者都不是，就立即返回
		} 
		else 
		{
			return UCCI_COMM_NONE;
		}
		// 然后寻找是否指定了后续着法，即是否有"moves"关键字
		lpLineChar = strstr(lpLineChar, " moves ");
		ucsCommand.Position.nMoveNum = 0;
		if (lpLineChar != NULL) 
		{
			lpLineChar += 7;
			ucsCommand.Position.nMoveNum = ((strlen(lpLineChar) + 1) / 5); // 提示："moves"后面的每个着法都是4个字符和1个空格
			for (i = 0; i < ucsCommand.Position.nMoveNum; i ++) 
			{
				dwCoordList[i] = *(long *) lpLineChar; // 4个字符可转换为一个"long"，存储和处理起来方便
				lpLineChar += 5;
			}
			ucsCommand.Position.lpdwCoordList = dwCoordList;
		}
		return UCCI_COMM_POSITION;
	}//蒋鹏注:position选项结束

	// 4. "banmoves <move_list>"指令，处理起来和"position ... moves ..."是一样的
	else if (strncmp(lpLineChar, "banmoves ", 9) == 0) 
	{
		lpLineChar += 9;
		ucsCommand.BanMoves.nMoveNum = ((strlen(lpLineChar) + 1) / 5);
		for (i = 0; i < ucsCommand.Position.nMoveNum; i ++) 
		{
			dwCoordList[i] = *(long *) lpLineChar;
			lpLineChar += 5;
		}
		ucsCommand.BanMoves.lpdwCoordList = dwCoordList;
		return UCCI_COMM_BANMOVES;
	}

	// 5. "go [ponder] {infinite | depth <depth> | time <time> [movestogo <moves_to_go> | increment <inc_time>]}"指令
	else if (strncmp(lpLineChar, "go ", 3) == 0) 
	{
		lpLineChar += 3;
		// 首先判断到底是"go"还是"go ponder"，因为两者解释成不同的指令
		if (strncmp(lpLineChar, "ponder ", 7) == 0) 
		{
			lpLineChar += 7;
			uceReturnValue = UCCI_COMM_GOPONDER;
		}
		else if(strncmp(lpLineChar, "draw ", 5) == 0) 
		{
			lpLineChar += 5;	//对方提和
		}
		else 
		{
			uceReturnValue = UCCI_COMM_GO;
		}
		// 然后判断到底是固定深度还是设定时限
		if (strncmp(lpLineChar, "time ", 5) == 0) 
		{
			lpLineChar += 5;
			ucsCommand.Search.DepthTime.nTime = ReadDigit(lpLineChar, 3600000);//最大时限60分钟
		} 
		else if (strncmp(lpLineChar, "depth ", 6) == 0) 
		{
			lpLineChar += 6;
			ucsCommand.Search.utMode = UCCI_TIME_DEPTH;
			ucsCommand.Search.DepthTime.nDepth = ReadDigit(lpLineChar, UCCI_MAX_DEPTH - 1);
			// 如果没有说明是固定深度还是设定时限，就固定深度为"UCCI_MAX_DEPTH"
		} 
		else 
		{
			ucsCommand.Search.utMode = UCCI_TIME_DEPTH;
			ucsCommand.Search.DepthTime.nDepth = UCCI_MAX_DEPTH - 1;
		}
		return uceReturnValue;
	}
  
	// 5. "stop"指令
	else if (strcmp(lpLineChar, "stop") == 0) 
	{
		return UCCI_COMM_STOP;
	}
	// 6. "quit"指令
	else if (strcmp(lpLineChar, "quit") == 0) 
	{
		return UCCI_COMM_QUIT;
	}
	// 7. 无法识别的指令
	else 
	{
		return UCCI_COMM_NONE;
	}
}

UcciCommEnum BusyLine(BOOL bDebug) 
{
	char szLineStr[LINE_INPUT_MAX_CHAR];
	if (pipeStdHandle.LineInput(szLineStr)) 
	{
		if (strcmp(szLineStr, "stop") == 0) 
		{
			return UCCI_COMM_STOP;
		} 
		else if (strcmp(szLineStr, "quit") == 0) 
		{
			return UCCI_COMM_QUIT;
		}
		else 
		{
			return UCCI_COMM_NONE;
		}
	} 
	else 
	{
		return UCCI_COMM_NONE;
	}
}
