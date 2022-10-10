// TODO statusを自動更新にする

package controller

import (
	"pms/src/view"

	"github.com/gin-gonic/gin"
)

// HandlerFunc for GET /api/status/[poker or mahjong]
func GetStatus(c *gin.Context) {
	c.JSON(200, gin.H{
		"status": "alive",
	})
}

// HandlerFunc for GET /api/status/[poker or mahjong]
func RoomStatus(c *gin.Context) {
	game := c.Param("game")
	roomID := c.Param("roomID")
	if game != "poker" {
		view.RequestError(c, "no such game is supported in PMC")
		return
	}
	_, existbool := pr[roomID]

	if existbool && pr[roomID].RoomData.Round == 0 {
		// RoomData.Round == 0 のときは参加待機中
		res := map[string]string{"status": "waiting"}
		view.StatusOK(c, res)
	} else if existbool {
		// RoomData.Round != 0のときはゲームが始まっている
		res := map[string]string{"status": "on game"}
		view.StatusOK(c, res)
	} else {
		// RoomIDが存在しない場合、ゲーム終了済みorルームが存在しない
		// どっちにしてもfinishedを返す。
		res := map[string]string{"status": "finished"}
		view.StatusOK(c, res)
	}
}
