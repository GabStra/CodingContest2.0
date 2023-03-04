#include <list>
#include <unordered_map>
#include <string>
#include<tuple> 


struct Game{
	int day;
	int startTime;
	int endTime;
	int partecipationFee;
	int WinPrice;
};

struct GameComparatorReward
{
    bool operator ()(const Game & game1, const Game & game2)
    {
        return (game1.WinPrice-game1.partecipationFee)<(game2.WinPrice-game2.partecipationFee);
    }
};

struct GameComparatorEndTime
{
    bool operator ()(const Game & game1, const Game & game2)
    {	if(game1.endTime==game2.endTime) 
			return (game1.WinPrice-game1.partecipationFee)>(game2.WinPrice-game2.partecipationFee);

        return game1.endTime<game2.endTime;
    }
};

struct GameComparatorDay
{
    bool operator ()(const Game & game1, const Game & game2)
    {
        return game1.day<game2.day;
    }
};

void print(Game& game){
	cout<<game.day<<"\t";
	cout<<game.startTime<<"\t";
	cout<<game.endTime<<"\t";
	cout<<game.partecipationFee<<"\t";
	cout<<game.WinPrice;
	cout<<endl;
}

int getMaxProfit(list<Game>& games,list<Game>::iterator start,list<Game>::iterator end, int budget,unordered_map<int, tuple<int, int>>& map){	
	
	int mapIndex=distance(start,end);
	string path=to_string(mapIndex)+"-"+to_string(budget);
	if (map.find(mapIndex) != map.end() && get<0>(map[mapIndex])>=budget){
		return get<1>(map[mapIndex]);
	}
		

	//cout<<path<<"---"<<"Start: \t"; 
	//print(*start);

	//cout<<path<<"---"<<"Stop: \t"; 
	//print(*end);
	//cout<<endl;
	//cout<<path<<"---"<<"Get max profit - budget: "<<budget<<endl;
	
	
	if(budget<start->partecipationFee){
		map[mapIndex]=make_tuple(budget,0);
		return 0;
	}

	int currentProfit=(start->WinPrice-start->partecipationFee);
	int currentBudget=budget+currentProfit;
	//cout<<path<<"---"<<"Start - Current profit: "<<currentProfit<<endl;	
	
	int max=currentProfit;
	int newMax=0;
	for(auto index=next(start);index!=end;index++){
		if(start->day==index->day){
			if(start->endTime<=index->startTime && currentBudget>=index->partecipationFee){
				newMax=currentProfit+getMaxProfit(games,index,end,currentBudget,map);
			}
		}else if(currentBudget>=index->partecipationFee){
			newMax=currentProfit+getMaxProfit(games,index,end,currentBudget,map);
		}
		if(newMax>max) max=newMax;
	}
	//cout<<path<<"---"<<"children: "<<children<<endl;
	//cout<<path<<"---"<<"max: "<<max<<endl<<endl;
	map[mapIndex]= make_tuple(budget,max);
	return max;
}

int MaxProfit(list<Game>& games,int budget){
	int gamesCounter=games.size();

	
	games.sort(GameComparatorEndTime());
	games.sort(GameComparatorDay());

	unordered_map<int, tuple<int, int>>map;

	//for(auto game=games.begin();game!=games.end();game++){	
	//	print(*game);
	//}
	//cout<<endl;
	int maxProfit=0;

	for(auto g=games.begin();g!=games.end();g++){	
		int mapIndex=distance(g,games.end());
		int currentProfit=getMaxProfit(games,g,games.end(),budget,map);
		if(currentProfit>maxProfit) maxProfit=currentProfit;
	}

	return maxProfit+budget;
}

void program(ifstream& in,ofstream& out){
	for(int i=0;i<100;i++){
		int gamesCounter;
		in>>gamesCounter;
		int budget;
		in>>budget;
		list<Game> games;
		for(int i=0;i<gamesCounter;i++){
			Game game;
			in>>game.day;
			in>>game.startTime;
			in>>game.endTime;
			in>>game.partecipationFee;
			in>>game.WinPrice;
			games.push_back(game);
		}
		out<<MaxProfit(games,budget)<<endl;
	}
}