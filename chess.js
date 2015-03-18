function Chess() {
    ClearTable('MovesConsideredTable');
    ClearLog();
    SetElementContents('MachinesBestMove','');
    
	MaxDepth = document.getElementById('MaxDepth').value;
	CurDepth = 0;
	document.getElementById('MachinesBestMove').innerHTML = ColorNames[MachineColor + 1] + ' is thinking!! ';
	//alert( ColorNames[MachineColor + 1] + ' is thinking!! ' + MaxDepth);
	
	t0 = performance.now();
	var MyBestMove = FindTheBestOfAllPossibleMoves(CurrentTurn).slice();
	t1 = performance.now();
	ElapsedTime = (t1 - t0).toFixed(0);
	
	// IF WE'RE MOVING A PAWN, ROOK, OR KING IN ITS INITIAL POSITION, SWITCH IT FOR A MOVED PIECE NOW THAT IT HAS MOVED
	switch(MyBestMove[MoveColorPieceInx][PIECE]) {
		case PAWNi:
			MyBestMove[MoveColorPieceInx][PIECE] = PAWN;
			break;
		case ROOKi:
			MyBestMove[MoveColorPieceInx][PIECE] = ROOK;
			break;
		case KINGi:
			MyBestMove[MoveColorPieceInx][PIECE] = KING;
			break;
	}
	
	MovePiece(MyBestMove);
	ShowMove(MyBestMove);
	WriteToMoveLog(MyBestMove);
	
	document.getElementById('MachinesBestMove').innerHTML = "Machine's last move:<br>" 
        + ExplainMove(MyBestMove) 
        + '<br>Moves considered: ' + FormatWithCommas(GlobalMoveCount) 
        + '<br>Elapsed time: ' + ElapsedTime/1000 + ' seconds';

	document.getElementById('NextRowFrom').value = '';
	document.getElementById('NextFileFrom').value = '';
	document.getElementById('NextRowTo').value = '';
	document.getElementById('NextFileTo').value = '';
    SwitchTurns();
}	

function UpdateScreen() {
	ShowMove();
	if(ChessIsRunning == true) {
		setTimeout(UpdateScreen, 50);
	}
}	

function FindTheBestOfAllPossibleMoves(Color) {
    CurDepth++;
	var BestMove = NullMove.slice();
    var BestMoveScore = 0.0;
    var BestMoveForThisPiece = NullMove.slice();
    var BestScoreForThisPiece = 0.0;
    var File, Row;
    
    /*
	WriteLogEntry('<br>Move ' + CurDepth + ': Finding best of all possible moves for ' + ColorNames[Color + 1] + ':');
	*/
    
    for (Row = 0; Row < 8; Row++) {
        for (File = 0; File < 8; File++) {
            if (Board[Row][File][0] == Color) {
                switch (Board[Row][File][1]) {
                case PAWN: // Pawn
                case PAWNi: // Pawn in initial position
                    BestMoveForThisPiece = FindBestMoveForPawn(Row, File);
                    break;
                case ROOK: // Rook
                case ROOKi: // Rook in initial position
                    BestMoveForThisPiece = FindBestMoveForRook(Row, File);
                    break;
                case KNIGHT: // Knight
                    BestMoveForThisPiece = FindBestMoveForKnight(Row, File);
                    break;
                case BISHOP: // Bishop
                    BestMoveForThisPiece = FindBestMoveForBishop(Row, File);
                    break;
                case QUEEN: // Queen
                    BestMoveForThisPiece = FindBestMoveForQueen(Row, File);
                    break;
                case KING: // King
                case KINGi: // King in initial position
                    BestMoveForThisPiece = FindBestMoveForKing(Row, File);
                    break;
                default:
                }
                
                BestScoreForThisPiece = BestMoveForThisPiece[MoveScoreInx];
                
                if (BestScoreForThisPiece > BestMoveScore) {
                //if (BestMoveForThisPiece[MoveScoreInx] > BestMove[MoveScoreInx]) {
                    if (DebugLevel > 0) {
                        WriteLogEntry("Saving this piece's best move as best for this turn so far. "
                            + ' (' + BestScoreForThisPiece + ' > ' + BestMoveScore + '):<br>'
                            + ExplainMove(BestMoveForThisPiece));
                    }
                    BestMoveScore = BestScoreForThisPiece;
                    BestMove = BestMoveForThisPiece.slice();                     
                }
            }
        }
        
    }
    
    WriteLogEntry( 'Best: ' + SuccinctMove(BestMove));
	
    CurDepth--; if (CurDepth < 0) {alert('exception: CurDepth < 0'); }
    
    return BestMove.slice();
}

function FindBestMoveForPawn(Row, File) { 
    // Note there are two pawn pieces, PAWN and PAWNi (unmoved pawn on initial square)
    var MyPiece = Board[Row][File][PIECE];
    if (MyPiece == PAWNi) {
        Board[Row][File][PIECE] = PAWN;
    }
    
    var BestPieceMove = NullMove.slice();
    var BestScore = 0;
    var PieceMoveCount = 0;
    var MyColor = Board[Row][File][COLOR];
    var OtherColor = -MyColor;
    var ScoredMove;
    
    WriteCurrentPieceAndPos(Row,File, Board[Row][File][0], Board[Row][File][1]);
    
    var NewRow, NewFile, PromotionRow;
    
    // If any move is to last row, promote the pawn to a queen AND knight
    if (MyColor == WHITE) { PromotionRow = 0; } else { PromotionRow = 7;}
    // Further logic in  CheckPawnPos
    
    // WHITE will decrement row; BLACK will increment row
    if (MyColor == WHITE) { NewRow = Row - 1; } else { NewRow = Row + 1;}

    // If left diagonal pos is occupied by opponent, move there and take the piece
    NewFile = File - 1;
    if ((NewFile >= 0) && (Board[NewRow][NewFile][COLOR] == OtherColor)) {
        CheckPawnPos();    
    }
    
    // If right diagonal pos is occupied by opponent, move there and take the piece
    NewFile = File + 1;
    if ((NewFile < 8) && (Board[NewRow][NewFile][COLOR] == OtherColor)) {
        CheckPawnPos();    
    }
    
    // Move one row forward (just now done ^), if pos is empty
    NewFile = File;
    if (Board[NewRow][NewFile][COLOR] == EMPTY) {
        CheckPawnPos(); 
    
        // If on initial pos and the way is clear (tested above), move two rows forward, if pos is empty (and en passant doesn't apply)
        /// NOTE: that we are not yet testing for en passant!!!
        if (MyPiece == PAWNi) {
            if (MyColor == WHITE) { NewRow = Row - 2; } else { NewRow = Row + 2; }
            if (Board[NewRow][NewFile][COLOR] == EMPTY) {
                CheckPawnPos();    
            }
        }   
    }
    
    // Restore pawn's original status (unmoved or unpromoted), if appropriate, just before returning
    Board[Row][File][PIECE] = MyPiece;
    return BestPieceMove;

    // internal function
    function CheckPawnPos () {        
        //WriteLogEntry('Checking row ' + NewRow + ', file ' + NewFile + ':');
        if ((NewRow >= 0) && (NewRow < 8) && (NewFile >= 0) && (NewFile < 8)
            && (Board[NewRow][NewFile][COLOR] != MyColor)) {
            
            if (NewRow == PromotionRow) {
                //Generate promotion to Queen
                PieceMoveCount++;
                Board[Row][File][PIECE] = QUEEN;
                ScoredMove = MoveAndScore(Row, File, NewRow, NewFile, MoveTypePromoteQueen);    
                Board[Row][File][PIECE] = MyPiece;
                if (ScoredMove[MoveScoreInx]  > BestScore) {
                    BestPieceMove = ScoredMove.slice(); 
                    BestScore = ScoredMove[MoveScoreInx];
                    if (DebugLevel > 1) {
                        WriteLogEntry('Saved as best move for this piece so far. (' +
                        BestScore + ' > ' + OldBestScore + ')');
                    }
                }
                
                //Generate promotion to Knight
                PieceMoveCount++;
                Board[Row][File][PIECE] = KNIGHT;
                ScoredMove = MoveAndScore(Row, File, NewRow, NewFile, MoveTypePromoteKnight);    
                Board[Row][File][PIECE] = MyPiece;
                if (ScoredMove[MoveScoreInx]  > BestScore) {
                    BestPieceMove = ScoredMove.slice(); 
                    BestScore = ScoredMove[MoveScoreInx];
                    if (DebugLevel > 1) {
                        WriteLogEntry('Saved as best move for this piece so far. (' +
                        BestScore + ' > ' + OldBestScore + ')');
                    }
                } 
            } else {
                PieceMoveCount++;
                ScoredMove = MoveAndScore(Row, File, NewRow, NewFile, MoveTypeNormal);
                if (ScoredMove[MoveScoreInx]  > BestScore) {
                    BestPieceMove = ScoredMove.slice(); 
                    OldBestScore = BestScore;
                    BestScore = ScoredMove[MoveScoreInx];
                    if (DebugLevel > 1) {
                        WriteLogEntry('Saved as best move for this piece so far. (' +
                        BestScore + ' > ' + OldBestScore + ')');
                    }
                    
                }
            }
        }
    } // end internal function 
    
} // end function

function FindBestMoveForRook(Row, File) {
    var MyPiece = Board[Row][File][PIECE];
    if (MyPiece == ROOKi) {
        Board[Row][File][PIECE] = ROOK;
    }
    var MyColor = Board[Row][File][COLOR];
    
	var ScoredMove;
    var PieceName = 'Rook';
    var BestPieceMove = NullMove.slice();
    var BestScore = 0;
    var PieceMoveCount = 0;
    
    WriteCurrentPieceAndPos(Row,File, Board[Row][File][0], Board[Row][File][1]);
    
    var NewRow, NewFile, NewPosColor;
    
    // NORTH and SOUTH - file doesn't change
    NewFile = File;
    
    // NORTH - decrementing Row
    //WriteLogEntry('Decrementing row:');
    for(NewRow = Row - 1, NewPosColor = EMPTY; 
        NewRow >=0 && NewPosColor == EMPTY; 
        NewRow--) {
        
        NewPosColor = CheckRookPos();
    }
    
    // SOUTH -incrementing Row
    NewFile = File;
    //WriteLogEntry('Incrementing row:' );
    for(NewRow = Row + 1, NewPosColor = EMPTY; 
        NewRow < 8 && NewPosColor == EMPTY; 
        NewRow++) {
        
        NewPosColor = CheckRookPos();
    }
    
    // EAST and WEST - Row doesn't change
    NewRow = Row;
    
    // EAST - incrementing File
    NewRow = Row;
    //WriteLogEntry('Incrementing file:');
    for(NewFile = File + 1, NewPosColor = EMPTY; 
        NewFile < 8 && NewPosColor == EMPTY; 
        NewFile++) {
        
        NewPosColor = CheckRookPos();
    }
    
    // WEST - decrementing File
    //WriteLogEntry('Decrementing file:');
    for(NewFile = File - 1, NewPosColor = EMPTY; 
        NewFile >=0 && NewPosColor == EMPTY; 
        NewFile--) {
        
        NewPosColor = CheckRookPos();
    }
    
    // Restore rook's original status (unmoved or unpromoted), if appropriate, just before returning
    Board[Row][File][PIECE] = MyPiece;
    return BestPieceMove;

    // internal function
    function CheckRookPos () {
        var PosColor = Board[NewRow][NewFile][COLOR];
        if (PosColor != MyColor) {
            PieceMoveCount++;
            ScoredMove = MoveAndScore(Row, File, NewRow, NewFile, MoveTypeNormal);
            if (ScoredMove[MoveScoreInx]  > BestScore) {
                BestPieceMove = ScoredMove.slice(); 
                BestScore = ScoredMove[MoveScoreInx];
                    if (DebugLevel > 1) {
                        WriteLogEntry('Saved as best move for this piece so far. (' +
                        BestScore + ' > ' + OldBestScore + ')');
                    }
            }
        }
        return PosColor;
    } // end internal function 
    
} // end function
    
function FindBestMoveForKnight(Row, File) {
    var PieceName = 'Knight';
    var BestPieceMove = NullMove.slice();
    var BestScore = 0;
    var PieceMoveCount = 0;
    var MyColor = Board[Row][File][COLOR];
    var ScoredMove;
    
    WriteCurrentPieceAndPos(Row,File, Board[Row][File][0], Board[Row][File][1]);
    
    var NewRow, NewFile;
    
    // NORTHWEST - decrementing row and file
    NewRow = Row - 1; NewFile = File - 2; CheckKnightPos();
    NewRow = Row - 2; NewFile = File - 1; CheckKnightPos();
    
    // NORTHEAST - decrementing row, incrementing file
    NewRow = Row - 1; NewFile = File + 2; CheckKnightPos();
    NewRow = Row - 2; NewFile = File + 1; CheckKnightPos();
    
    // SOUTHWEST - incrementing row, decrementing file
    NewRow = Row + 1; NewFile = File - 2; CheckKnightPos();
    NewRow = Row + 2; NewFile = File - 1; CheckKnightPos();
    
    // SOUTHEAST - incrementing row and file
    NewRow = Row + 1; NewFile = File + 2; CheckKnightPos();
    NewRow = Row + 2; NewFile = File + 1; CheckKnightPos();
    
    return BestPieceMove;

    // internal function
    function CheckKnightPos () {        
        if ((NewRow >= 0) && (NewRow < 8) && (NewFile >= 0) && (NewFile < 8)
            && (Board[NewRow][NewFile][COLOR] != MyColor)) {
            PieceMoveCount++;
            ScoredMove = MoveAndScore(Row, File, NewRow, NewFile, MoveTypeNormal);
            if (ScoredMove[MoveScoreInx]  > BestScore) {
                BestPieceMove = ScoredMove.slice(); 
                BestScore = ScoredMove[MoveScoreInx];
                    if (DebugLevel > 1) {
                        WriteLogEntry('Saved as best move for this piece so far. (' +
                        BestScore + ' > ' + OldBestScore + ')');
                    }
            }
        }
    } // end internal function 
    
} // end function

function FindBestMoveForBishop(Row, File) {
    var PieceName = 'Bishop';
    var BestPieceMove = NullMove.slice();
    var BestScore = 0;
    var PieceMoveCount = 0;
    var MyColor = Board[Row][File][COLOR];
    var ScoredMove;
    
    WriteCurrentPieceAndPos(Row,File, Board[Row][File][0], Board[Row][File][1]);
    
    var NewRow, NewFile, NewPosColor;
    
    // NORTHWEST - decrementing row and file
    // WriteLogEntry('Northwest - decrementing row and file' );
    
    for(NewRow = Row - 1, NewFile = File - 1, NewPosColor = EMPTY; 
        NewRow >= 0 && NewFile >= 0 && NewPosColor == EMPTY; 
        NewRow--, NewFile--) {
        
        NewPosColor = CheckBishopPos();
    }
 
    // NORTHEAST - decrementing row, incrementing file
    // WriteLogEntry('Northeast - decrementing row, incrementing file' );
    for(NewRow = Row - 1, NewFile = File + 1, NewPosColor = EMPTY; 
        NewRow >= 0 && NewFile < 8 && NewPosColor == EMPTY; 
        NewRow--, NewFile++) {
        
        NewPosColor = CheckBishopPos();
    }
    
    // SOUTHWEST - incrementing row, decrementing file
    // WriteLogEntry('Southwest - incrementing row, decrementing file' );
    for(NewRow = Row + 1, NewFile = File - 1, NewPosColor = EMPTY; 
        NewRow < 8 && NewFile >= 0 && NewPosColor == EMPTY; 
        NewRow++, NewFile--) {
        
        NewPosColor = CheckBishopPos();
    }
    
    // SOUTHEAST - incrementing row and file
    // WriteLogEntry('Southeast - incrementing row and file' );
    for(NewRow = Row + 1, NewFile = File + 1, NewPosColor = EMPTY; 
        NewRow < 8 && NewFile < 8 && NewPosColor == EMPTY; 
        NewRow++, NewFile++) {
        
        NewPosColor = CheckBishopPos();
    }
 
    return BestPieceMove;

    // internal function
    function CheckBishopPos () {
        var PosColor = Board[NewRow][NewFile][COLOR];
        if (PosColor != MyColor) {
            PieceMoveCount++;
            ScoredMove = MoveAndScore(Row, File, NewRow, NewFile, MoveTypeNormal);
            if (ScoredMove[MoveScoreInx]  > BestScore) {
                BestPieceMove = ScoredMove.slice(); 
                BestScore = ScoredMove[MoveScoreInx];
                if (DebugLevel > 1) {
                    WriteLogEntry('Saved as best move for this piece so far. (' +
                    BestScore + ' > ' + OldBestScore + ')');
                }
            }
        }
        return PosColor;
    } // end internal function 
    
} // end function

function FindBestMoveForQueen(Row, File) {
    var PieceName = 'Queen';
    var BestPieceMove = NullMove.slice();
    var BestScore = 0;
    var PieceMoveCount = 0;
    var MyColor = Board[Row][File][COLOR];
    var ScoredMove;
    
    WriteCurrentPieceAndPos(Row,File, Board[Row][File][0], Board[Row][File][1]);
    
    var NewRow, NewFile, NewPosColor;
    
    // NORTHWEST - decrementing row and file
    // WriteLogEntry('Northwest - decrementing row and file' );
    for(NewRow = Row - 1, NewFile = File - 1, NewPosColor = EMPTY; 
        NewRow >= 0 && NewFile >= 0 && NewPosColor == EMPTY; 
        NewRow--, NewFile--) {
        
        NewPosColor = CheckQueenPos();
    }
 
    // NORTHEAST - decrementing row, incrementing file
    // WriteLogEntry('Northeast - decrementing row, incrementing file' );
    for(NewRow = Row - 1, NewFile = File + 1, NewPosColor = EMPTY; 
        NewRow >= 0 && NewFile < 8 && NewPosColor == EMPTY; 
        NewRow--, NewFile++) {
        
        NewPosColor = CheckQueenPos();
    }
    
    // SOUTHWEST - incrementing row, decrementing file
    // WriteLogEntry('Southwest - incrementing row, decrementing file' );
    for(NewRow = Row + 1, NewFile = File - 1, NewPosColor = EMPTY; 
        NewRow < 8 && NewFile >= 0 && NewPosColor == EMPTY; 
        NewRow++, NewFile--) {
        
        NewPosColor = CheckQueenPos();
    }
    
    // SOUTHEAST - incrementing row and file
    // WriteLogEntry('Southeast - incrementing row and file' );
    for(NewRow = Row + 1, NewFile = File + 1, NewPosColor = EMPTY; 
        NewRow < 8 && NewFile < 8 && NewPosColor == EMPTY; 
        NewRow++, NewFile++) {
        
        NewPosColor = CheckQueenPos();
    }
 
    // NORTH and SOUTH - File doesn't change
    NewFile = File;
    
    // NORTH - decrementing Row
    // WriteLogEntry('Decrementing row:');
    for(NewRow = Row - 1, NewPosColor = EMPTY; 
        NewRow >=0 && NewPosColor == EMPTY; 
        NewRow--) {
        
        NewPosColor = CheckQueenPos();
    }
    
    // SOUTH -incrementing Row
    // WriteLogEntry('Incrementing row:' );
    for(NewRow = Row + 1, NewPosColor = EMPTY; 
        NewRow < 8 && NewPosColor == EMPTY; 
        NewRow++) {
        
        NewPosColor = CheckQueenPos();
    }
    
    // EAST and WEST - Row doesn't change
    NewRow = Row;
    
    // EAST - incrementing File
    // WriteLogEntry('Incrementing file:');
    for(NewFile = File + 1, NewPosColor = EMPTY; 
        NewFile < 8 && NewPosColor == EMPTY; 
        NewFile++) {
        
        NewPosColor = CheckQueenPos();
    }
    
    // WEST - decrementing File
    // WriteLogEntry('Decrementing file:');
    for(NewFile = File - 1, NewPosColor = EMPTY; 
        NewFile >=0 && NewPosColor == EMPTY; 
        NewFile--) {
        
        NewPosColor = CheckQueenPos();
    }
    
    return BestPieceMove;

    // internal function
    function CheckQueenPos () {
        var PosColor = Board[NewRow][NewFile][COLOR];
        if (PosColor != MyColor) {
            PieceMoveCount++;
            ScoredMove = MoveAndScore(Row, File, NewRow, NewFile, MoveTypeNormal);
            if (ScoredMove[MoveScoreInx]  > BestScore) {
                BestPieceMove = ScoredMove.slice(); 
                BestScore = ScoredMove[MoveScoreInx];
                if (DebugLevel > 1) {
                    WriteLogEntry('Saved as best move for this piece so far. (' +
                    BestScore + ' > ' + OldBestScore + ')');
                }
            }
        }
        return PosColor;
    } // end internal function 
    
} // end function

function FindBestMoveForKing(Row, File) {
    var MyPiece = Board[Row][File][PIECE];
    if (MyPiece == KINGi) {
        Board[Row][File][PIECE] = KING;
    }
    var PieceName = 'King';
    var BestPieceMove = NullMove.slice();
    var BestScore = 0;
    var PieceMoveCount = 0;
    var MyColor = Board[Row][File][COLOR];
    var ScoredMove;
    
    WriteCurrentPieceAndPos(Row,File, Board[Row][File][0], Board[Row][File][1]);
    
    var NewRow, NewFile;
    
    // NORTHWEST - decrementing row and file
    NewRow = Row - 1; NewFile = File - 1; CheckKingPos();    
    // NORTHEAST - decrementing row, incrementing file
    NewRow = Row - 1; NewFile = File + 1; CheckKingPos();    
    // SOUTHWEST - incrementing row, decrementing file
    NewRow = Row + 1; NewFile = File - 1; CheckKingPos();    
    // SOUTHEAST - incrementing row and file
    NewRow = Row + 1; NewFile = File + 1; CheckKingPos();
    
    // NORTH and SOUTH
    NewFile = File;
    NewRow = Row - 1; CheckKingPos(); 
    NewRow = Row + 1; CheckKingPos();
    
    // EAST and WEST
    NewRow = Row;
    NewFile = File - 1; CheckKingPos();
    NewFile = File + 1; CheckKingPos();
    
    // Restore king's original status (unmoved or unpromoted), if appropriate, just before returning
    Board[Row][File][PIECE] = MyPiece;
    return BestPieceMove;

    // internal function
    function CheckKingPos () {        
        if ((NewRow >= 0) && (NewRow < 8) && (NewFile >= 0) && (NewFile < 8)
            && (Board[NewRow][NewFile][COLOR] != MyColor)) {
            PieceMoveCount++;
            ScoredMove = MoveAndScore(Row, File, NewRow, NewFile, MoveTypeNormal);
            if (ScoredMove[MoveScoreInx]  > BestScore) {
                BestPieceMove = ScoredMove.slice(); 
                BestScore = ScoredMove[MoveScoreInx];
                if (DebugLevel > 1) {
                    WriteLogEntry('Saved as best move for this piece so far. (' +
                    BestScore + ' > ' + OldBestScore + ')');
                }
            }
        }
    } // end internal function 
    
} // end function

function MoveAndScore (Row, File, NewRow, NewFile, MoveType) {
    //Build Move
    var MyPos = [Row, File];
    var MyColorPiece = Board[Row][File];
    var MyColor = MyColorPiece[COLOR];
	
	var NewPos = [NewRow,NewFile];
    var NewPosOldContents = Board[NewRow][NewFile];
    var CurrentPieceMove;
    var ThisMoveScore;
    
    var MoveTag = GenerateMoveTag();
    
    // Detect checkmate (if we're taking the king)
    if (Board[NewRow][NewFile][PIECE] >= KINGi) { // KINGi or KING
        MoveType = MoveTypeCheckmate;
    }
    
    CurrentPieceMove = [0.0, MoveType, MyColorPiece, MyPos, NewPos, NewPosOldContents];
    
    MovePiece(CurrentPieceMove);
	
	/*
    if (CurDepth <= DisplayDepth) {
		 WriteLogEntry('Move ' + MoveTag + ExplainMove(CurrentPieceMove));
	}
    */
    
	switch(true) {
		case(MoveType == MoveTypeCheckmate):
            ThisMoveScore = 100000 - CurDepth; // earlier checkmates trump deeper ones
            WriteLogEntry(SuccinctMove(CurrentPieceMove));
			break;
		case (CurDepth >= MaxDepth):
			ThisMoveScore = EvaluateBoard(MyColor);
            
            CurrentPieceMove[MoveScoreInx] = ThisMoveScore;
            WriteLogEntry(SuccinctMove(CurrentPieceMove) + ' eval');
            
			break;
		default:
		      
			// Look ahead or evaluate
			var OtherColor = -MyColor;
			
            WriteLogEntry(SuccinctMove(CurrentPieceMove) + ':');
            
            var BestOpponentMove = FindTheBestOfAllPossibleMoves(OtherColor).slice();
        
			// Get the score
			var BestOpponentScore = BestOpponentMove[MoveScoreInx];

			//Current color's score is reciprocal of other color's score
			ThisMoveScore = 1 / BestOpponentScore;
            
            CurrentPieceMove[MoveScoreInx] = ThisMoveScore;
            WriteLogEntry(SuccinctMove(CurrentPieceMove));
    }
    
    CurrentPieceMove[MoveScoreInx] = ThisMoveScore;
    // Log
    if (CurDepth <= DisplayDepth) {
		 //WriteLogEntry('Scoring move ' + MoveTag + ': ' + ExplainMove(CurrentPieceMove));
        WriteToMovesConsideredTable(CurrentPieceMove);
	}
        
    // Restore board by unmoving (return piece to original position)
    UnMovePiece(CurrentPieceMove);
    
    return CurrentPieceMove;
}

function EvaluateBoardX(Color) {
    // This is run at the maximum depth of lookaheads if a check has not taken place
	
    var File, Row;
    //var ColorsPieceCounts = [0,0,0,0,0,0,0,0,0,0];
    //var OpponentsPieceCounts = [0,0,0,0,0,0,0,0,0,0];
    var ThisPiece, ThisColor;
	
    var PieceValues = [
        0,   // empty
        100, // unmoved pawn
        100, // pawn
        500, // unmoved rook
        500, // rook
        300, // knight
        300, // bishop
        900, // queen
        100, // unmoved king
        100  // king
    ];
	PawnValues = [
	[500,200,150,120,110,100,100,100], // white = -1
	[0,0,0,0,0,0,0,0],
	[100,100,100,110,120,150,200,500] // black = 1
	];
	
    var RowWeightFactor, FileWeightFactor;
    var MyPieceScore = 0, OpponentsPieceScore = 0;
	
    for (Row = 0; Row < 8; Row++) {
		
		// Weigh the center two rows
        if (Row > 2 && Row < 5) {
            RowWeightFactor = 1.1; 
        } else {
            RowWeightFactor = 1;
        }
        
        
        for (File = 0; File < 8; File++) {
			// Weigh the center two files
            if (File > 2 && File < 5) {
                FileWeightFactor = 1.1; 
            } else {
                FileWeightFactor = 1;
            }
            
			ThisPiece = Board[Row][File][PIECE];
			ThisColor = Board[Row][File][COLOR];
			console.log('Valuing ' + ThisColor + ThisPiece + ' at ' + Row + File);

            switch(ThisColor) {
            case Color:
				if (ThisPiece <= PAWN) { // PAWN or PAWNi
					MyPieceScore += PawnValues[ThisColor + 1][Row];
					//alert('c: ' + ColorAbbr[ThisColor + 1] + PieceAbbr[ThisPiece] + ' at ' + Row + File + ' is worth ' + PawnValues[ThisColor + 1][Row]);
				} else {
					MyPieceScore += PieceValues[ThisPiece] * RowWeightFactor * FileWeightFactor;
				}
                break;
            case 0:
                break;
            default:
				if (ThisPiece <= PAWN) { // PAWN or PAWNi
					OpponentsPieceScore += PawnValues[ThisColor + 1][Row];
					//alert('d: ' +ColorAbbr[ThisColor + 1] + PieceAbbr[ThisPiece] + ' at ' + Row + File + ' is worth ' + PawnValues[ThisColor + 1][Row]);
				} else {
					OpponentsPieceScore += PieceValues[ThisPiece] * RowWeightFactor * FileWeightFactor;
				}
            }
        }
    }
       
    var ThisScore = (MyPieceScore + 1) / (OpponentsPieceScore + 1);
    var MyMoveTag = GenerateMoveTag();
	/*
    WriteLogEntry(MyMoveTag + ' Evaluating board for ' + ColorNames[Color + 1] + ': ' 
        + MyPieceScore + ' / ' + OpponentsPieceScore 
        + ' = ' + ThisScore);
     */
    return ThisScore;
}

function EvaluateBoardSimple(Color) {
    // This is run at the maximum depth of lookaheads if a check has not taken place
	
    var File, Row;
    var ColorsPieceCounts = [0,0,0,0,0,0,0,0,0,0];
    var OpponentsPieceCounts = [0,0,0,0,0,0,0,0,0,0];
    var ThisPiece;
    var PieceValues = [
        0,   // empty
        100, // unmoved pawn
        100, // pawn
        500, // unmoved rook
        500, // rook
        300, // knight
        300, // bishop
        900, // queen
        100, // unmoved king
        100  // king
    ];
    var PieceValuesLength = PieceValues.length;
    for (Row = 0; Row < 8; Row++) {
        for (File = 0; File < 8; File++) {
            switch(Board[Row][File][0]) {
            case Color:
                ThisPiece = Board[Row][File][PIECE];
                ColorsPieceCounts[ThisPiece]++;
                break;
            case 0:
                break;
            default:
                ThisPiece = Board[Row][File][PIECE];
                OpponentsPieceCounts[ThisPiece]++;
            }
        }
    }
    
    var MyPieceScore = 0;
    for(ThisPiece = 1; ThisPiece < PieceValues.length; ThisPiece++) {
        MyPieceScore += ColorsPieceCounts[ThisPiece] * PieceValues[ThisPiece];
    }
    //MyPieceScore = MyPieceScore * ColorsPieceCounts[KING];
    
    var OpponentsPieceScore = 0;
    for(ThisPiece = 1; ThisPiece < PieceValues.length; ThisPiece++) {
        OpponentsPieceScore += OpponentsPieceCounts[ThisPiece] * PieceValues[ThisPiece];
    }
    //OpponentsPieceScore = OpponentsPieceScore * OpponentsPieceCounts[KING];
    
    var ThisScore = (MyPieceScore + 1) / (OpponentsPieceScore + 1);
    var MyMoveTag = GenerateMoveTag();
	/*
    WriteLogEntry(MyMoveTag + ' Evaluating board for ' + ColorNames[Color + 1] + ': ' 
        + MyPieceScore + ' / ' + OpponentsPieceScore 
        + ' = ' + ThisScore);
     */
    return ThisScore;
}

function EvaluateBoard(Color) {
    // This is run at the maximum depth of lookaheads if a check has not taken place
	
    var File, Row;
    var ColorsPieceCounts = [0,0,0,0,0,0,0,0,0,0];
    var OpponentsPieceCounts = [0,0,0,0,0,0,0,0,0,0];
    var ThisPiece;
    var PieceValues = [
        0,   // empty
        100, // unmoved pawn
        100, // pawn
        500, // unmoved rook
        500, // rook
        300, // knight
        300, // bishop
        900, // queen
        100, // unmoved king
        100  // king
    ];;
	PawnValues = [
	[500,200,150,120,110,100,100,100], // white = -1
	[0,0,0,0,0,0,0,0],
	[100,100,100,110,120,150,200,500] // black = 1
	];
	
    var MyPieceScore = 0, OpponentsPieceScore = 0;
    
	for (Row = 0; Row < 8; Row++) {
        for (File = 0; File < 8; File++) {
			ThisColor = Board[Row][File][COLOR];
			ThisPiece = Board[Row][File][PIECE];
			
            switch(ThisColor) {
            case Color:
				if (ThisPiece <= PAWN) { // PAWN or PAWNi
					MyPieceScore += PawnValues[ThisColor + 1][Row];
					//alert('c: ' + ColorAbbr[ThisColor + 1] + PieceAbbr[ThisPiece] + ' at ' + Row + File + ' is worth ' + PawnValues[ThisColor + 1][Row]);
				} else {
					MyPieceScore += PieceValues[ThisPiece];
				}
                break;
            case 0:
                break;
            default:
				if (ThisPiece <= PAWN) { // PAWN or PAWNi
					OpponentsPieceScore += PawnValues[ThisColor + 1][Row];
					//alert('d: ' +ColorAbbr[ThisColor + 1] + PieceAbbr[ThisPiece] + ' at ' + Row + File + ' is worth ' + PawnValues[ThisColor + 1][Row]);
				} else {
					OpponentsPieceScore += PieceValues[ThisPiece];
				}
            }
        }
    }
      
    var ThisScore = (MyPieceScore + 1) / (OpponentsPieceScore + 1);
    var MyMoveTag = GenerateMoveTag();
	/*
    WriteLogEntry(MyMoveTag + ' Evaluating board for ' + ColorNames[Color + 1] + ': ' 
        + MyPieceScore + ' / ' + OpponentsPieceScore 
        + ' = ' + ThisScore);
     */
    return ThisScore;
}
