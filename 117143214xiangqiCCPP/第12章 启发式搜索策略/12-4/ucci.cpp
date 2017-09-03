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

/* UCCIָ�����ģ��������UCCIָ���������ɡ�
 *
 * ���е�һ��������"BootLine()"��򵥣�ֻ������������������ĵ�һ��ָ��
 * ����"ucci"ʱ�ͷ���"UCCI_COMM_UCCI"������һ�ɷ���"UCCI_COMM_NONE"
 * ǰ�������������ȴ��Ƿ������룬���û��������ִ�д���ָ��"Idle()"
 * ��������������("BusyLine()"��ֻ��������˼��ʱ)����û������ʱֱ�ӷ���"UCCI_COMM_NONE"
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
strncmp(char *s1,char * s2��int n);
  ���ܣ��Ƚ��ַ���s1��s2��ǰn���ַ���
  
  ˵����
        ��s1<s2ʱ������ֵ<0
        ��s1=s2ʱ������ֵ=0
        ��s1>s2ʱ������ֵ>0
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

	  // 1. "isready"ָ��
	if (strcmp(lpLineChar, "isready") == 0) 
	{
		return UCCI_COMM_ISREADY;
	} 
	// 2. "setoption <option> [<arguments>]"ָ��
	else if (strncmp(lpLineChar, "setoption ", 10) == 0) 
	{
		lpLineChar += 10;
		return UCCI_COMM_SETOPTION;
	}//����ע:OPTIONѡ�����
  
	// 3. "position {<special_position> | fen <fen_string>} [moves <move_list>]"ָ��
	else if (strncmp(lpLineChar, "position ", 9) == 0) 
	{
		lpLineChar += 9;

		if (strncmp(lpLineChar, "fen ", 4) == 0) 
		{
			ucsCommand.Position.szFenStr = lpLineChar + 4;
			// ������߶����ǣ�����������
		} 
		else 
		{
			return UCCI_COMM_NONE;
		}
		// Ȼ��Ѱ���Ƿ�ָ���˺����ŷ������Ƿ���"moves"�ؼ���
		lpLineChar = strstr(lpLineChar, " moves ");
		ucsCommand.Position.nMoveNum = 0;
		if (lpLineChar != NULL) 
		{
			lpLineChar += 7;
			ucsCommand.Position.nMoveNum = ((strlen(lpLineChar) + 1) / 5); // ��ʾ��"moves"�����ÿ���ŷ�����4���ַ���1���ո�
			for (i = 0; i < ucsCommand.Position.nMoveNum; i ++) 
			{
				dwCoordList[i] = *(long *) lpLineChar; // 4���ַ���ת��Ϊһ��"long"���洢�ʹ�����������
				lpLineChar += 5;
			}
			ucsCommand.Position.lpdwCoordList = dwCoordList;
		}
		return UCCI_COMM_POSITION;
	}//����ע:positionѡ�����

	// 4. "banmoves <move_list>"ָ�����������"position ... moves ..."��һ����
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

	// 5. "go [ponder] {infinite | depth <depth> | time <time> [movestogo <moves_to_go> | increment <inc_time>]}"ָ��
	else if (strncmp(lpLineChar, "go ", 3) == 0) 
	{
		lpLineChar += 3;
		// �����жϵ�����"go"����"go ponder"����Ϊ���߽��ͳɲ�ͬ��ָ��
		if (strncmp(lpLineChar, "ponder ", 7) == 0) 
		{
			lpLineChar += 7;
			uceReturnValue = UCCI_COMM_GOPONDER;
		}
		else if(strncmp(lpLineChar, "draw ", 5) == 0) 
		{
			lpLineChar += 5;	//�Է����
		}
		else 
		{
			uceReturnValue = UCCI_COMM_GO;
		}
		// Ȼ���жϵ����ǹ̶���Ȼ����趨ʱ��
		if (strncmp(lpLineChar, "time ", 5) == 0) 
		{
			lpLineChar += 5;
			ucsCommand.Search.DepthTime.nTime = ReadDigit(lpLineChar, 3600000);//���ʱ��60����
		} 
		else if (strncmp(lpLineChar, "depth ", 6) == 0) 
		{
			lpLineChar += 6;
			ucsCommand.Search.utMode = UCCI_TIME_DEPTH;
			ucsCommand.Search.DepthTime.nDepth = ReadDigit(lpLineChar, UCCI_MAX_DEPTH - 1);
			// ���û��˵���ǹ̶���Ȼ����趨ʱ�ޣ��͹̶����Ϊ"UCCI_MAX_DEPTH"
		} 
		else 
		{
			ucsCommand.Search.utMode = UCCI_TIME_DEPTH;
			ucsCommand.Search.DepthTime.nDepth = UCCI_MAX_DEPTH - 1;
		}
		return uceReturnValue;
	}
  
	// 5. "stop"ָ��
	else if (strcmp(lpLineChar, "stop") == 0) 
	{
		return UCCI_COMM_STOP;
	}
	// 6. "quit"ָ��
	else if (strcmp(lpLineChar, "quit") == 0) 
	{
		return UCCI_COMM_QUIT;
	}
	// 7. �޷�ʶ���ָ��
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
