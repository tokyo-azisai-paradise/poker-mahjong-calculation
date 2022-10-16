package view

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 500 InternalServerError
func InternalServerError(c *gin.Context, msg string) {
	c.JSON(http.StatusInternalServerError, gin.H{
		"message": msg,
	})
	log.Println(msg)
}
