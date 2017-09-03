
#include "def.h"
#include <stdio.h>
const int MaxValue = 3000;	//估值最大值

class CBoard  
{
public:
	CBoard();
	virtual ~CBoard();


	//************************************************************************
	//                  变量声明
	//************************************************************************

	int side;					// 轮到哪方走，0表示红方，1表示黑方
	unsigned char board[256];	// 棋盘数组
	unsigned char piece[48];	// 棋子数组
	char FenString[128];		// 局面的FEN串格式

	move MoveStack[128];	// 执行的走法栈
	int StackTop;			// 栈顶指针,指向栈顶元素的下一位置,=0表示栈空
	move BestMove;	//搜索得到的最佳走法
	int ply;		// 当前搜索深度
	int MaxDepth;	//最大搜索深度

	unsigned long ZobristPlayer;	//32位的走棋方键值
	unsigned __int64 ZobristPlayerCheck;	//64伴的走棋方校验值
	unsigned long ZobristTable[14][256];	//32位的棋子在棋盘各位置的键值
	unsigned __int64 ZobristTableCheck[14][256];	//64位的棋子在棋盘各位置的校验值

	unsigned long ZobristKey;	//局面的Zobrist键值
	unsigned __int64 ZobristKeyCheck;//局面的Zobrist校验值
	unsigned long HashMask;	//
	HashNode * HashTable;	//哈希表

	//************************************************************************
	//                  函数声明
	//************************************************************************

	// 局面表示相关函数------------------------------------
	void ClearBoard();				// 清空棋盘数组
	void OutputBoard();				// 输出棋盘数组
	void OutputPiece();				// 输出棋子数组
	char IntToChar(int a);			// 棋子整数值转换成字符值
	int CharToSubscript(char ch);	// FEN串中棋子对应的数组下标
		//下标0，1，2，3，4，5，6分别对应表示将，仕，象，马，车，炮，兵

	void AddPiece(int pos, int pc);			// 在pos位置增加棋子pc
	void StringToArray(const char *FenStr); // 将FEN串表示的局面转换成一维数组
	void ArrayToString();					// 将一维数组表示的局面转换成FEN串

	// 走法生成相关函数-----------------------------------
	int SaveMove(unsigned char from, unsigned char to,move * mv);//保存生成的走法,成功返回1，失败返回0
	int GenAllMove(move * MoveArray);	//生成所有的走法
	void OutputMove(move * MoveArray, int MoveNum);//输出所有的走法
	int Check(int lSide);		//检测lSide一方是否被将军，是被将军返回1，否则返回0
	int LegalMove(move mv);		//判断走法是否合理
	int HasLegalMove();			//判断当前局面是否有合理走法，没有则判输

	// 评估函数 ------------------------------------------
	short Eval();				// 评估函数
	int IntToSubscript(int a);	// 棋子整数值转换成下标
		//下标0，1，2，3，4，5，6分别对应表示将，仕，象，马，车，炮，兵

	// 搜索函数------------------------------------------
	void ComputerThink();	//电脑思考
	int AlphaBetaSearch(int depth, int alpha, int beta);	// Alpha-Beta搜索算法
	bool MakeMove(move m);	// 执行走法
	void UnMakeMove();		// 撤消走法
	void ChangeSide();		// 交换走棋方

	//哈希表相关函数 在hash.cpp中------------------------------------
	void IniZobrist();	//生成键值和校验值函数
	void ClearHashTable();	//清空哈希表
	int ReadHashTable(int depth);	//读哈希表,成功返回局面的估值，失败返回NOVALUE
	void SaveHashTable(int value, int depth);	//写哈希表，将当前局面估值value写入哈希表
	void NewHashTable();	//生成哈希数组
	void DelHashTable();	//销毁哈希数组
};

extern CBoard g_Board;
